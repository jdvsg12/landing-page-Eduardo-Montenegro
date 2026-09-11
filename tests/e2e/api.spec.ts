import { SignJWT } from "jose"
import { createService, createTaller, expect, slugOf, test, uniqueTitle } from "./helpers"
import { E2E_SERVER_ENV } from "./env"

test.describe("API sin sesión", () => {
  const mutations: [string, string, unknown?][] = [
    ["POST", "/api/services", { title: { es: "Intruso" } }],
    ["PUT", "/api/services/cualquiera", { published: false }],
    ["DELETE", "/api/services/cualquiera"],
    ["POST", "/api/talleres", { title: "Intruso", date: "2030-01-01", cost: "x", excerpt: "x" }],
    ["PUT", "/api/talleres/cualquiera", { published: false }],
    ["DELETE", "/api/talleres/cualquiera"],
    ["PUT", "/api/admin/content/hero", {}],
    ["GET", "/api/admin/content/hero"],
  ]

  for (const [method, url, data] of mutations) {
    test(`${method} ${url} responde 401`, async ({ request }) => {
      const res = await request.fetch(url, { method, data })
      expect(res.status()).toBe(401)
    })
  }

  test("subir archivos sin sesión responde 401", async ({ request }) => {
    const res = await request.post("/api/admin/upload", {
      multipart: { file: { name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") } },
    })
    expect(res.status()).toBe(401)
  })

  test("una cookie falsificada no abre el panel ni la API", async ({ playwright }) => {
    const forged = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("no-es-el-secreto"))
    const ctx = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
      extraHTTPHeaders: { cookie: `admin_session=${forged}` },
    })
    expect((await ctx.put("/api/admin/content/hero", { data: {} })).status()).toBe(401)
    const page = await ctx.get("/admin", { maxRedirects: 0 })
    expect(page.status()).toBe(307)
    expect(page.headers().location).toContain("/admin/login")
    await ctx.dispose()
  })

  test("una sesión vencida redirige al login", async ({ playwright }) => {
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(new TextEncoder().encode(E2E_SERVER_ENV.ADMIN_JWT_SECRET))
    const ctx = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
      extraHTTPHeaders: { cookie: `admin_session=${expired}` },
    })
    const res = await ctx.get("/admin/servicios", { maxRedirects: 0 })
    expect(res.status()).toBe(307)
    await ctx.dispose()
  })
})

test.describe("login", () => {
  for (const [label, data] of [
    ["contraseña incorrecta", { password: "otra" }],
    ["cuerpo vacío", {}],
    ["contraseña vacía", { password: "" }],
    ["contraseña que no es texto", { password: ["e2e-admin-password"] }],
    ["null", null],
  ] as const) {
    test(`rechaza ${label} sin dejar cookie`, async ({ request }) => {
      const res = await request.post("/api/admin/login", { data: data as never })
      expect(res.status()).toBe(401)
      expect(res.headers()["set-cookie"] ?? "").not.toContain("admin_session")
    })
  }

  test("JSON malformado responde 401, no 500", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      headers: { "Content-Type": "application/json" },
      data: "{password:",
    })
    expect(res.status()).toBe(401)
  })

  test("la cookie de sesión es httpOnly y SameSite=Lax", async ({ request }) => {
    const res = await request.post("/api/admin/login", { data: { password: E2E_SERVER_ENV.ADMIN_PASSWORD } })
    const cookie = res.headers()["set-cookie"]
    expect(cookie).toContain("admin_session=")
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })
})

test.describe("API de servicios", () => {
  test("rechaza crear sin título en español", async ({ api }) => {
    const res = await api.post("/api/services", { data: { title: { en: "Only English" } } })
    expect(res.status()).toBe(400)
  })

  test("rechaza un título sin letras ni números (slug vacío)", async ({ api }) => {
    const res = await api.post("/api/services", { data: { title: { es: "¿¡!?" } } })
    expect(res.status()).toBe(400)
  })

  test("rechaza JSON malformado y cuerpos que no son objetos", async ({ api }) => {
    for (const data of ["{roto", "[]", "null", "\"texto\""]) {
      const res = await api.post("/api/services", { headers: { "Content-Type": "application/json" }, data })
      expect(res.status(), data).toBe(400)
    }
  })

  test("un título repetido no sobrescribe el servicio existente (409)", async ({ api }) => {
    const title = uniqueTitle("Duplicado")
    const original = await createService(api, { title: { es: title }, kicker: { es: "original" } })
    const res = await api.post("/api/services", { data: { title: { es: title }, kicker: { es: "intruso" } } })
    expect(res.status()).toBe(409)
    const stored = await (await api.get(`/api/services/${original.slug}`)).json()
    expect(stored.kicker).toEqual({ es: "original" })
  })

  test("descarta enlaces javascript: y data: en calendario e inscripción", async ({ api }) => {
    const service = await createService(api, {
      showCalendar: true,
      calendarUrl: "javascript:alert(document.cookie)",
      showRegistration: true,
      registrationUrl: "data:text/html,<script>alert(1)</script>",
    })
    const stored = await (await api.get(`/api/services/${service.slug}`)).json()
    expect(stored.calendarUrl).toBeUndefined()
    expect(stored.registrationUrl).toBeUndefined()
  })

  test("una actualización parcial solo cambia la visibilidad", async ({ api }) => {
    const service = await createService(api, { kicker: { es: "bajada" }, position: 7 })
    const res = await api.put(`/api/services/${service.slug}`, { data: { published: false } })
    expect(res.status()).toBe(200)
    const stored = await (await api.get(`/api/services/${service.slug}`)).json()
    expect(stored).toMatchObject({ published: false, kicker: { es: "bajada" }, position: 7 })
  })

  test("editar o borrar un servicio inexistente no crea nada", async ({ api }) => {
    expect((await api.put("/api/services/no-existe-e2e", { data: { published: true } })).status()).toBe(404)
    expect((await api.get("/api/services/no-existe-e2e")).status()).toBe(404)
  })

  test("los privados no aparecen para el público ni por su URL de API", async ({ api, request }) => {
    const service = await createService(api, { published: false })
    const list = await (await request.get("/api/services")).json()
    expect(list.map((s: { slug: string }) => s.slug)).not.toContain(service.slug)
    expect((await request.get(`/api/services/${service.slug}`)).status()).toBe(404)
    // `?all=1` sin sesión tampoco los muestra
    const all = await (await request.get("/api/services?all=1")).json()
    expect(all.map((s: { slug: string }) => s.slug)).not.toContain(service.slug)
  })

  test("no acepta inscripciones en un servicio sin formulario", async ({ api, request }) => {
    const service = await createService(api, { showForm: false })
    const res = await request.post(`/api/services/${service.slug}/lead`, {
      data: { name: "Ana Pérez", email: "a@x.co", phone: "3001112233", terms: true },
    })
    expect(res.status()).toBe(404)
  })
})

test.describe("API de talleres", () => {
  for (const [label, data, status] of [
    ["sin campos", {}, 400],
    ["costo solo con espacios", { title: "Taller válido", date: "2030-01-01", cost: "   ", excerpt: "x" }, 400],
    ["fecha con otro formato", { title: "Taller fecha", date: "20/05/2030", cost: "x", excerpt: "x" }, 400],
    ["fecha imposible", { title: "Taller imposible", date: "2030-02-30", cost: "x", excerpt: "x" }, 400],
    ["título sin letras", { title: "¿¡!?", date: "2030-01-01", cost: "x", excerpt: "x" }, 400],
  ] as const) {
    test(`rechaza ${label}`, async ({ api }) => {
      expect((await api.post("/api/talleres", { data })).status()).toBe(status)
    })
  }

  test("un título repetido responde 409 y no pisa el existente", async ({ api }) => {
    const title = uniqueTitle("Taller repetido")
    await createTaller(api, { title, cost: "COP 1" })
    const res = await api.post("/api/talleres", { data: { title, date: "2031-01-01", cost: "COP 2", excerpt: "x" } })
    expect(res.status()).toBe(409)
    const stored = await (await api.get(`/api/talleres/${slugOf(title)}`)).json()
    expect(stored.cost).toBe("COP 1")
  })

  test("editar con una fecha inválida no cambia nada", async ({ api }) => {
    const taller = await createTaller(api)
    expect((await api.put(`/api/talleres/${taller.slug}`, { data: { date: "mañana" } })).status()).toBe(400)
  })

  test("un taller privado no se ve para el público", async ({ api, request }) => {
    const taller = await createTaller(api, { published: false })
    expect((await request.get(`/api/talleres/${taller.slug}`)).status()).toBe(404)
    const list = await (await request.get("/api/talleres?all=1")).json()
    expect(list.map((t: { slug: string }) => t.slug)).not.toContain(taller.slug)
    const adminList = await (await api.get("/api/talleres?all=1")).json()
    expect(adminList.map((t: { slug: string }) => t.slug)).toContain(taller.slug)
  })
})

test.describe("API de contenido", () => {
  test("rechaza secciones desconocidas", async ({ api }) => {
    for (const key of ["services", "__proto__", "constructor"]) {
      expect((await api.put(`/api/admin/content/${key}`, { data: {} })).status(), key).toBe(404)
    }
  })

  test("rechaza datos con la forma equivocada sin guardar nada", async ({ api }) => {
    const before = await (await api.get("/api/admin/content/hero")).json()
    const res = await api.put("/api/admin/content/hero", { data: { ...before, image: 42 } })
    expect(res.status()).toBe(400)
    expect(await (await api.get("/api/admin/content/hero")).json()).toEqual(before)
  })

  test("rechaza JSON malformado", async ({ api }) => {
    const res = await api.put("/api/admin/content/faq", { headers: { "Content-Type": "application/json" }, data: "{" })
    expect(res.status()).toBe(400)
  })
})

test.describe("subida de imágenes", () => {
  test("rechaza archivos que no son imágenes", async ({ api }) => {
    for (const [name, mimeType] of [
      ["pagina.html", "text/html"],
      ["logo.svg", "image/svg+xml"],
      ["script.js", "application/javascript"],
    ]) {
      const res = await api.post("/api/admin/upload", {
        multipart: { file: { name, mimeType, buffer: Buffer.from("<script>alert(1)</script>") } },
      })
      expect(res.status(), name).toBe(415)
    }
  })

  test("rechaza imágenes de más de 8 MB", async ({ api }) => {
    const res = await api.post("/api/admin/upload", {
      multipart: { file: { name: "enorme.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(8 * 1024 * 1024 + 1) } },
    })
    expect(res.status()).toBe(413)
  })

  test("rechaza la petición sin archivo o con archivo vacío", async ({ api }) => {
    expect((await api.post("/api/admin/upload", { multipart: { prefix: "site/hero" } })).status()).toBe(400)
    const empty = await api.post("/api/admin/upload", {
      multipart: { file: { name: "vacio.png", mimeType: "image/png", buffer: Buffer.alloc(0) } },
    })
    expect(empty.status()).toBe(400)
  })
})
