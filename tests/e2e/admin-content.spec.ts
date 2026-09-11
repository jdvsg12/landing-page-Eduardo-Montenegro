import { acceptNextDialog, expect, putContent, setLanguage, test, withContentRestore } from "./helpers"

type Localized = Partial<Record<"es" | "en" | "fr", string>>

test.describe("editor del hero", () => {
  test("cambia el título en español, avisa de cambios sin guardar y lo publica", async ({ api, adminPage: page, browser }) => {
    await withContentRestore(api, "hero", async () => {
      await page.goto("/admin/hero")
      await page.getByLabel("Título", { exact: true }).fill("TÍTULO DE PRUEBA E2E")
      await expect(page.getByText("Tienes cambios sin guardar.")).toBeVisible()
      await page.getByRole("button", { name: "Guardar cambios" }).click()
      await expect(page.getByText("Cambios guardados y publicados.")).toBeVisible()

      const visitor = await browser.newPage()
      await visitor.goto("/")
      await expect(visitor.locator("#hero h1")).toHaveText("TÍTULO DE PRUEBA E2E")
      await visitor.close()
    })
  })

  test("un idioma vacío muestra el español en la web", async ({ api, browser }) => {
    await withContentRestore<{ title: Localized; marquee: Localized }>(api, "hero", async (hero) => {
      await putContent(api, "hero", { ...hero, title: { es: "SOLO ESPAÑOL", en: "   ", fr: "" }, marquee: { es: "MARQUESINA" } })
      const context = await browser.newContext()
      await setLanguage(context, "fr")
      const page = await context.newPage()
      await page.goto("/")
      await expect(page.locator("#hero h1")).toHaveText("SOLO ESPAÑOL")
      await expect(page.locator("#hero")).toContainText("MARQUESINA")
      await context.close()
    })
  })

  test("si guardar falla, lo dice y no marca como guardado", async ({ adminPage: page }) => {
    await page.goto("/admin/hero")
    await page.route("**/api/admin/content/hero", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Fallo simulado" }) })
    )
    await page.getByLabel("Subtítulo").fill("No debería guardarse")
    await page.getByRole("button", { name: "Guardar cambios" }).click()
    await expect(page.getByText("Fallo simulado")).toBeVisible()
    await expect(page.getByText("Cambios guardados y publicados.")).toHaveCount(0)
  })

  test("el punto de 'sin traducir' aparece cuando falta inglés", async ({ api, adminPage: page }) => {
    await withContentRestore<{ subtitle: Localized }>(api, "hero", async (hero) => {
      await putContent(api, "hero", { ...hero, subtitle: { es: "Solo en español" } })
      await page.goto("/admin/hero")
      await expect(page.getByRole("button", { name: /English/ }).getByTitle("Sin traducir")).toBeVisible()
    })
  })
})

test.describe("editor de Sobre mí", () => {
  test("una pantalla nueva con dos párrafos se ve como dos párrafos", async ({ api, adminPage: page, browser }) => {
    await withContentRestore(api, "about", async () => {
      await page.goto("/admin/sobre-mi")
      await page.getByRole("button", { name: "+ Nueva pantalla" }).click()
      const lastScreen = page.locator("section").filter({ hasText: /^Pantalla \d+/ }).last()
      await lastScreen.getByLabel("Subtítulo (ES)").fill("Bloque de prueba")
      await lastScreen.getByLabel("Texto (ES)").fill("Primer párrafo de prueba.\n\n\nSegundo párrafo de prueba.")
      await page.getByRole("button", { name: "Guardar cambios" }).click()
      await expect(page.getByText("Cambios guardados y publicados.")).toBeVisible()

      const visitor = await browser.newPage()
      await visitor.goto("/")
      const block = visitor.locator("#about article").filter({ hasText: "Bloque de prueba" })
      await expect(block.locator("p")).toHaveText(["Primer párrafo de prueba.", "Segundo párrafo de prueba."])
      await visitor.close()
    })
  })

  test("borrar una pantalla pide confirmación y bloques vacíos no dejan huecos", async ({ api, adminPage: page, browser }) => {
    await withContentRestore<{ screens: unknown[] }>(api, "about", async (about) => {
      await putContent(api, "about", {
        ...about,
        screens: [...about.screens, { blocks: [{ title: {}, body: { es: "   " } }] }],
      })
      const visitor = await browser.newPage()
      await visitor.goto("/")
      await expect(visitor.locator("#about article")).toHaveCount(about.screens.length)
      await visitor.close()

      await page.goto("/admin/sobre-mi")
      const screens = page.locator("section").filter({ hasText: /^Pantalla \d+/ })
      const count = await screens.count()
      acceptNextDialog(page)
      await screens.last().getByRole("button", { name: /^Eliminar pantalla/ }).click()
      await expect(screens).toHaveCount(count - 1)
    })
  })

  test("Sobre mí sin pantallas no rompe la home", async ({ api, browser }) => {
    await withContentRestore(api, "about", async () => {
      await putContent(api, "about", { title: { es: "Sobre mí" }, screens: [] })
      const visitor = await browser.newPage()
      const errors: string[] = []
      visitor.on("pageerror", (error) => errors.push(error.message))
      await visitor.goto("/")
      await expect(visitor.locator("#about h2")).toHaveText("Sobre mí")
      expect(errors).toEqual([])
      await visitor.close()
    })
  })
})

test.describe("editor del FAQ", () => {
  test("preguntas sin respuesta y categorías vacías no se publican", async ({ api, browser }) => {
    await withContentRestore<{ categories: unknown[] }>(api, "faq", async (faq) => {
      await putContent(api, "faq", {
        ...faq,
        categories: [
          ...faq.categories,
          { name: { es: "Categoría incompleta" }, items: [{ question: { es: "¿Sin respuesta?" }, answer: { es: "" } }] },
          { name: { es: "" }, items: [{ question: { es: "¿Huérfana?" }, answer: { es: "Sí" } }] },
        ],
      })
      const page = await browser.newPage()
      await page.goto("/#faq")
      await expect(page.locator("#faq").getByRole("button", { name: "Categoría incompleta" })).toHaveCount(0)
      await expect(page.locator("#faq").getByText("¿Huérfana?")).toHaveCount(0)
      await page.close()
    })
  })

  test("sin categorías la sección desaparece sin errores", async ({ api, browser }) => {
    await withContentRestore(api, "faq", async () => {
      await putContent(api, "faq", { title: { es: "FAQ" }, categories: [] })
      const page = await browser.newPage()
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.goto("/")
      await expect(page.locator("#faq")).toHaveCount(0)
      expect(errors).toEqual([])
      await page.close()
    })
  })

  test("agregar una categoría con su pregunta desde el panel la publica", async ({ api, adminPage: page, browser }) => {
    await withContentRestore(api, "faq", async () => {
      await page.goto("/admin/faq")
      await page.getByRole("button", { name: "+ Nueva categoría" }).click()
      await page.getByLabel("Nombre de la pestaña (ES)").fill("Categoría E2E")
      await page.getByLabel("Pregunta 1 (ES)").last().fill("¿Pregunta de prueba?")
      await page.getByLabel("Respuesta 1 (ES)").last().fill("Respuesta de prueba.")
      await page.getByRole("button", { name: "Guardar cambios" }).click()
      await expect(page.getByText("Cambios guardados y publicados.")).toBeVisible()

      const visitor = await browser.newPage()
      await visitor.goto("/#faq")
      await visitor.locator("#faq").getByRole("button", { name: "Categoría E2E" }).click()
      await visitor.locator("#faq").getByRole("button", { name: "¿Pregunta de prueba?" }).click()
      await expect(visitor.locator("#faq").getByText("Respuesta de prueba.")).toBeVisible()
      await visitor.close()
    })
  })
})

test.describe("ajustes, SEO y datos legales", () => {
  test("el título SEO en inglés se usa en la pestaña del navegador", async ({ api, browser }) => {
    await withContentRestore<{ title: Localized }>(api, "seo", async (seo) => {
      await putContent(api, "seo", { ...seo, title: { ...seo.title, en: "E2E English Title" } })
      const context = await browser.newContext()
      await setLanguage(context, "en")
      const page = await context.newPage()
      await page.goto("/")
      await expect(page).toHaveTitle("E2E English Title")
      await context.close()
    })
  })

  test("un dominio inválido no tumba el sitio", async ({ api, request }) => {
    await withContentRestore(api, "seo", async (seo) => {
      await putContent(api, "seo", { ...(seo as object), siteUrl: "esto no es una url" })
      const res = await request.get("/")
      expect(res.status()).toBe(200)
      expect((await request.get("/privacidad")).status()).toBe(200)
    })
  })

  test("documento y domicilio aparecen en la política cuando se completan", async ({ api, adminPage: page, browser }) => {
    await withContentRestore(api, "legal", async () => {
      await page.goto("/admin/ajustes")
      await page.getByLabel("Documento de identidad").fill("C.C. 1.234.567")
      await page.getByLabel("Domicilio", { exact: true }).fill("Bogotá D.C., Colombia")
      await page.getByRole("button", { name: "Guardar cambios" }).click()
      await expect(page.getByText("Cambios guardados y publicados.")).toBeVisible()

      const visitor = await browser.newPage()
      await visitor.goto("/privacidad")
      await expect(visitor.locator("main")).toContainText("Documento de identidad: C.C. 1.234.567")
      await expect(visitor.locator("main")).toContainText("Domicilio: Bogotá D.C., Colombia")
      await visitor.close()
    })
  })

  test("una fecha legal vacía no se guarda y avisa", async ({ api, adminPage: page }) => {
    const before = await (await api.get("/api/admin/content/legal")).json()
    await page.goto("/admin/ajustes")
    await page.getByLabel("Fecha de última actualización").fill("")
    await page.getByRole("button", { name: "Guardar cambios" }).click()
    await expect(page.getByText(/Datos inválidos/)).toBeVisible()
    expect(await (await api.get("/api/admin/content/legal")).json()).toEqual(before)
  })

  test("el contador marca las descripciones SEO demasiado largas", async ({ adminPage: page }) => {
    await page.goto("/admin/ajustes")
    await page.getByLabel("Descripción", { exact: true }).fill("x".repeat(161))
    await expect(page.getByText("161 / 160 caracteres recomendados")).toHaveClass(/text-amber-700/)
  })
})
