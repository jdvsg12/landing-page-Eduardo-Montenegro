import {
  acceptNextDialog,
  createService,
  createTaller,
  dismissNextDialog,
  expect,
  resend,
  slugOf,
  test,
  uniqueTitle,
} from "./helpers"
import { ADMIN_PASSWORD } from "./env"

test.describe("acceso al panel", () => {
  test("sin sesión cualquier ruta del admin lleva al login", async ({ page }) => {
    for (const path of ["/admin", "/admin/servicios/nuevo", "/admin/ajustes", "/admin/faq"]) {
      await page.goto(path)
      await expect(page, path).toHaveURL(/\/admin\/login$/)
    }
  })

  test("contraseña incorrecta muestra error y no entra", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByPlaceholder("Contraseña").fill("incorrecta")
    await page.getByRole("button", { name: "INGRESAR" }).click()
    await expect(page.getByText("Contraseña incorrecta")).toBeVisible()
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test("el error se limpia al volver a escribir", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByPlaceholder("Contraseña").fill("mal")
    await page.getByRole("button", { name: "INGRESAR" }).click()
    await expect(page.getByText("Contraseña incorrecta")).toBeVisible()
    await page.getByPlaceholder("Contraseña").fill("otra")
    await expect(page.getByText("Contraseña incorrecta")).toHaveCount(0)
  })

  test("entrar, navegar el menú lateral y salir", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByPlaceholder("Contraseña").fill(ADMIN_PASSWORD)
    await page.getByRole("button", { name: "INGRESAR" }).click()
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()

    const nav = page.getByRole("navigation", { name: "Administración" })
    for (const [label, heading] of [
      ["Ajustes y SEO", "Ajustes y SEO"],
      ["Hero", "Hero"],
      ["Sobre mí", "Sobre mí"],
      ["Servicios", "Servicios"],
      ["Talleres", "Talleres"],
      ["FAQ", "Preguntas frecuentes"],
    ]) {
      await nav.getByRole("link", { name: label }).click()
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible()
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page")
    }

    await page.getByRole("button", { name: "Salir" }).click()
    await expect(page).toHaveURL(/\/admin\/login$/)
    await page.goto("/admin/servicios")
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})

test.describe("servicios en el panel", () => {
  test("no deja crear sin título en español", async ({ adminPage: page }) => {
    await page.goto("/admin/servicios/nuevo")
    await page.getByRole("button", { name: "English" }).click()
    await page.getByLabel("Título (EN)").fill("Only English")
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "El título en español es obligatorio" })).toBeVisible()
    await expect(page.getByLabel("Título (ES)")).toBeVisible()
  })

  test("valida WhatsApp sin número y enlaces que no son https", async ({ adminPage: page }) => {
    await page.goto("/admin/servicios/nuevo")
    await page.getByLabel("Título (ES)").fill(uniqueTitle("Validacion"))
    await page.getByLabel("Número de WhatsApp").fill("")
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "escribe el número" })).toBeVisible()

    await page.getByLabel("Número de WhatsApp").fill("+573001112233")
    await page.getByText("Botón de calendario").click()
    await page.getByLabel("Enlace del calendario").fill("calendar.google.com/sin-protocolo")
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Activaste el calendario" })).toBeVisible()

    await page.getByLabel("Enlace del calendario").fill("https://calendar.app.google/ok")
    await page.getByText("Link de inscripción externo").click()
    await page.getByLabel("Enlace de inscripción").fill("javascript:alert(1)")
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Activaste el link de inscripción" })).toBeVisible()
  })

  test("crea un servicio completo y un título repetido muestra el error del servidor", async ({ adminPage: page }) => {
    const title = uniqueTitle("Servicio panel")
    await page.goto("/admin/servicios/nuevo")
    await page.getByLabel("Título (ES)").fill(title)
    await expect(page.getByText(`/servicios/${slugOf(title)}`)).toBeVisible()
    await page.getByLabel("Bajada de la card (ES)").fill("Bajada de prueba")
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page).toHaveURL(/\/admin\/servicios$/)
    await expect(page.getByRole("heading", { name: title })).toBeVisible()

    await page.goto("/admin/servicios/nuevo")
    await page.getByLabel("Título (ES)").fill(title)
    await page.getByRole("button", { name: "Crear servicio" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Ya existe un servicio" })).toBeVisible()
    await expect(page).toHaveURL(/\/nuevo$/)
  })

  test("el selector Público/Privado del listado guarda sin abrir el formulario", async ({ api, adminPage: page }) => {
    const service = await createService(api, { title: { es: uniqueTitle("Toggle") } })
    await page.goto("/admin/servicios")
    const row = page.getByRole("listitem").filter({ hasText: service.title.es })
    await row.getByRole("radio", { name: "Privado" }).click()
    await expect(row.getByRole("radio", { name: "Privado" })).toHaveAttribute("aria-checked", "true")
    await expect
      .poll(async () => (await (await api.get(`/api/services/${service.slug}`)).json()).published)
      .toBe(false)

    await page.getByRole("button", { name: /^Privados/ }).click()
    await expect(page.getByRole("heading", { name: service.title.es })).toBeVisible()
    await page.getByRole("button", { name: /^Públicos/ }).click()
    await expect(page.getByRole("heading", { name: service.title.es })).toHaveCount(0)

    await page.reload()
    await expect(
      page.getByRole("listitem").filter({ hasText: service.title.es }).getByRole("radio", { name: "Privado" })
    ).toHaveAttribute("aria-checked", "true")
  })

  test("si el servidor falla al cambiar la visibilidad, revierte y avisa", async ({ api, adminPage: page }) => {
    const service = await createService(api, { title: { es: uniqueTitle("Falla toggle") } })
    await page.goto("/admin/servicios")
    await page.route(`**/api/services/${service.slug}`, (route) =>
      route.request().method() === "PUT" ? route.fulfill({ status: 500, body: "{}" }) : route.continue()
    )
    const row = page.getByRole("listitem").filter({ hasText: service.title.es })
    await row.getByRole("radio", { name: "Privado" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "No se pudo cambiar la visibilidad" })).toBeVisible()
    await expect(row.getByRole("radio", { name: "Público" })).toHaveAttribute("aria-checked", "true")
    expect((await (await api.get(`/api/services/${service.slug}`)).json()).published).toBe(true)
  })

  test("borrar pide confirmación: cancelar conserva, aceptar elimina", async ({ api, adminPage: page }) => {
    const service = await createService(api, { title: { es: uniqueTitle("Borrar") } })
    await page.goto("/admin/servicios")
    const row = page.getByRole("listitem").filter({ hasText: service.title.es })

    dismissNextDialog(page)
    await row.getByRole("button", { name: "Eliminar" }).click()
    await expect(row).toBeVisible()
    expect((await api.get(`/api/services/${service.slug}`)).status()).toBe(200)

    acceptNextDialog(page)
    await row.getByRole("button", { name: "Eliminar" }).click()
    await expect(page.getByRole("heading", { name: service.title.es })).toHaveCount(0)
    expect((await api.get(`/api/services/${service.slug}`)).status()).toBe(404)
  })

  test("editar conserva los datos existentes y el slug", async ({ api, adminPage: page }) => {
    const service = await createService(api, {
      title: { es: uniqueTitle("Editar"), en: "Edit me" },
      showCalendar: true,
      calendarUrl: "https://calendar.app.google/keep",
    })
    await page.goto(`/admin/servicios/${service.slug}/editar`)
    await page.getByLabel("Título (ES)").fill(`${service.title.es} cambiado`)
    await page.getByRole("button", { name: "Guardar cambios" }).click()
    await expect(page).toHaveURL(/\/admin\/servicios$/)
    const stored = await (await api.get(`/api/services/${service.slug}`)).json()
    expect(stored.title).toMatchObject({ es: `${service.title.es} cambiado`, en: "Edit me" })
    expect(stored.calendarUrl).toBe("https://calendar.app.google/keep")
  })

  test("la subida muestra el error del servidor y una subida correcta llena el campo", async ({ adminPage: page }) => {
    await page.goto("/admin/servicios/nuevo")
    const cardField = page.locator("div").filter({ has: page.getByText("Foto de la card (home)", { exact: true }) }).last()

    await page.route("**/api/admin/upload", (route) =>
      route.fulfill({ status: 415, contentType: "application/json", body: JSON.stringify({ error: "Solo se permiten imágenes JPG, PNG, WebP, AVIF o GIF" }) })
    )
    await cardField.locator('input[type="file"]').setInputFiles({ name: "x.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") })
    await expect(cardField.getByText("Solo se permiten imágenes")).toBeVisible()

    await page.unroute("**/api/admin/upload")
    await page.route("**/api/admin/upload", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "/images/profile.png" }) })
    )
    await cardField.locator('input[type="file"]').setInputFiles({ name: "ok.png", mimeType: "image/png", buffer: Buffer.from("png") })
    await expect(cardField.locator('input[type="text"]')).toHaveValue("/images/profile.png")
    await expect(cardField.getByText("Solo se permiten imágenes")).toHaveCount(0)
  })
})

test.describe("talleres en el panel", () => {
  test("crea un taller privado desde el formulario", async ({ api, adminPage: page }) => {
    const title = uniqueTitle("Taller privado")
    await page.goto("/admin/talleres/nuevo")
    await page.getByRole("radio", { name: "Privado" }).click()
    await expect(page.getByText("Queda guardado pero oculto")).toBeVisible()
    await page.locator('input[type="text"]').first().fill(title)
    await page.locator('input[type="date"]').fill("2031-03-15")
    await page.getByPlaceholder("Ej: COP 120.000 o Gratuito").fill("Gratuito")
    await page.locator("textarea").first().fill("Descripción corta")
    await page.getByRole("button", { name: "Crear taller" }).click()
    await expect(page).toHaveURL(/\/admin\/talleres$/)
    const stored = await (await api.get(`/api/talleres/${slugOf(title)}`)).json()
    expect(stored.published).toBe(false)
  })

  test("un título repetido muestra el error en el formulario", async ({ api, adminPage: page }) => {
    const taller = await createTaller(api)
    await page.goto("/admin/talleres/nuevo")
    await page.locator('input[type="text"]').first().fill(taller.title)
    await page.locator('input[type="date"]').fill("2031-03-15")
    await page.getByPlaceholder("Ej: COP 120.000 o Gratuito").fill("Gratuito")
    await page.locator("textarea").first().fill("Otra descripción")
    await page.getByRole("button", { name: "Crear taller" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Ya existe un taller" })).toBeVisible()
  })

  test("marca como pasados los talleres con fecha anterior a hoy", async ({ api, adminPage: page }) => {
    const past = await createTaller(api, { title: uniqueTitle("Taller pasado"), date: "2020-01-10" })
    await page.goto("/admin/talleres")
    await expect(page.getByRole("listitem").filter({ hasText: past.title }).getByText("Pasado", { exact: true })).toBeVisible()
  })
})

test.describe("inscripciones a un servicio", () => {
  test("valida, guarda la inscripción y aparece en el dashboard", async ({ api, page, browser, request }) => {
    await resend.reset(request)
    const service = await createService(api, { title: { es: uniqueTitle("Con formulario") }, showWhatsapp: false, showForm: true })
    await page.goto(`/servicios/${service.slug}`)

    await page.getByRole("button", { name: "Enviar inscripción" }).click()
    await expect(page.getByRole("alert").first()).toBeVisible()
    expect(await resend.emails(request)).toHaveLength(0)

    const name = uniqueTitle("Zoë")
    await page.getByLabel(/nombre/i).fill(name)
    await page.getByLabel(/correo/i).fill("zoe@example.com")
    await page.getByLabel(/teléfono/i).fill("+57 300 111 2233")
    await page.locator("#service-lead-terms").check()
    await page.getByRole("button", { name: "Enviar inscripción" }).click()
    await expect(page.getByText("¡Listo! Recibí tus datos")).toBeVisible()
    expect((await resend.emails(request)).map((email) => email.subject)).toEqual([
      `Nueva inscripción a "${service.title.es}" de ${name}`,
    ])

    const adminContext = await browser.newContext()
    const { loginBrowser } = await import("./helpers")
    await loginBrowser(adminContext)
    const admin = await adminContext.newPage()
    await admin.goto("/admin")
    await expect(admin.getByRole("row").filter({ hasText: name })).toContainText(service.title.es)
    await adminContext.close()
  })

  test("si el correo falla, la inscripción igual queda guardada", async ({ api, request }) => {
    const service = await createService(api, { showForm: true })
    await resend.failNext(request)
    const res = await request.post(`/api/services/${service.slug}/lead`, {
      data: { name: "Hélène Dupont", email: "h@example.fr", phone: "+33 6 12 34 56 78", terms: true, language: "fr" },
    })
    expect(res.status()).toBe(200)
  })
})
