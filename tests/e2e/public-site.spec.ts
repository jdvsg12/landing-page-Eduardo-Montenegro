import type { Page } from "@playwright/test"
import { createService, createTaller, expect, loginBrowser, setLanguage, test, uniqueTitle } from "./helpers"

/** Falla el test si la página lanza errores de JavaScript. */
function trackPageErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

test.describe("home", () => {
  test("carga sin errores de JavaScript y con los textos por defecto", async ({ page }) => {
    const errors = trackPageErrors(page)
    await page.goto("/")
    await expect(page.locator("#hero h1")).toHaveText("PSICÓLOGO - PSICOANALISTA")
    await expect(page.locator("#hero")).toContainText("EDUARDO MONTENEGRO")
    await expect(page.locator("#about h3")).toHaveText([
      "La práctica",
      "Lo que irrumpe",
      "La enseñanza",
      "La clínica y la investigación",
      "Te escucho.",
    ])
    await expect(page).toHaveTitle("Eduardo Montenegro Flórez | Psicólogo y Psicoanalista")
    expect(errors).toEqual([])
  })

  test("muestra los servicios públicos y oculta los privados", async ({ api, page }) => {
    const visible = await createService(api, { title: { es: uniqueTitle("Visible") } })
    const hidden = await createService(api, { title: { es: uniqueTitle("Oculto") }, published: false })
    await page.goto("/")
    await expect(page.locator(`#services a[href="/servicios/${visible.slug}"]`)).toHaveCount(1)
    await expect(page.locator(`#services a[href="/servicios/${hidden.slug}"]`)).toHaveCount(0)
  })

  test("un taller privado no aparece en la home", async ({ api, page }) => {
    const hidden = await createTaller(api, { title: uniqueTitle("Taller oculto"), published: false })
    await page.goto("/")
    await expect(page.locator(`a[href="/talleres/${hidden.slug}"]`)).toHaveCount(0)
  })

  test("cambiar de idioma traduce la página y se mantiene al recargar", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Idioma" }).first().click()
    await page.getByRole("option", { name: "ENG" }).click()
    await expect(page.locator("#hero h1")).toHaveText("PSYCHOLOGIST - PSYCHOANALYST")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    await page.reload()
    await expect(page.locator("#hero h1")).toHaveText("PSYCHOLOGIST - PSYCHOANALYST")
    await expect(page).toHaveTitle("Eduardo Montenegro Flórez | Psychologist and Psychoanalyst")
  })

  test("una cookie de idioma inválida cae en español", async ({ page, context }) => {
    await context.addCookies([{ name: "em-language", value: "xx", url: "http://localhost:3100" }])
    await page.goto("/")
    await expect(page.locator("#hero h1")).toHaveText("PSICÓLOGO - PSICOANALISTA")
    await expect(page.locator("html")).toHaveAttribute("lang", "es")
  })

  test("las pestañas del FAQ cambian de categoría y el acordeón abre la respuesta", async ({ page }) => {
    await page.goto("/#faq")
    const faq = page.locator("#faq")
    await faq.getByRole("button", { name: "Sobre supervisión" }).click()
    const question = faq.getByRole("button", { name: "¿En qué momentos es pertinente supervisar un caso?" })
    await expect(question).toBeVisible()
    await question.click()
    await expect(faq.getByText("La supervisión resulta pertinente cuando el analista")).toBeVisible()
    await expect(faq.getByRole("button", { name: "¿Qué se entiende por psicoanálisis?" })).toHaveCount(0)
  })

  test("con movimiento reducido la home muestra todo sin animaciones fijadas", async ({ browser, api }) => {
    const service = await createService(api, { title: { es: uniqueTitle("Sin movimiento") } })
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    const errors = trackPageErrors(page)
    await page.goto("/")
    await expect(page.locator(`#services a[href="/servicios/${service.slug}"]`)).toBeVisible()
    await expect(page.getByRole("heading", { name: "Ningún sufrimiento es insignificante" })).toBeVisible()
    expect(errors).toEqual([])
    await context.close()
  })
})

test.describe("página de servicio", () => {
  test("muestra solo los botones activos con enlaces correctos", async ({ api, page }) => {
    const service = await createService(api, {
      title: { es: uniqueTitle("Grupo completo") },
      showWhatsapp: true,
      whatsapp: "+57 (300) 111-2233",
      waMessage: { es: "Hola, quiero info & precios" },
      showCalendar: true,
      calendarUrl: "https://calendar.app.google/e2e",
      showRegistration: true,
      registrationUrl: "https://forms.gle/wokftp918cnrxchW9",
      registrationLabel: { es: "Inscribirme al GED" },
      showForm: true,
    })
    await page.goto(`/servicios/${service.slug}`)

    const whatsapp = page.getByRole("link", { name: "Contactar por WhatsApp" })
    await expect(whatsapp).toHaveAttribute(
      "href",
      `https://wa.me/573001112233?text=${encodeURIComponent("Hola, quiero info & precios")}`
    )
    await expect(whatsapp).toHaveAttribute("rel", /noopener/)
    await expect(page.getByRole("link", { name: "Agendar una cita" })).toHaveAttribute("href", "https://calendar.app.google/e2e")
    await expect(page.getByRole("link", { name: "Inscribirme al GED" })).toHaveAttribute(
      "href",
      "https://forms.gle/wokftp918cnrxchW9"
    )
    await expect(page.getByRole("button", { name: "Enviar inscripción" })).toBeVisible()
  })

  test("sin botones activos no muestra el bloque de acciones", async ({ api, page }) => {
    const service = await createService(api, { showWhatsapp: false, showForm: false })
    await page.goto(`/servicios/${service.slug}`)
    await expect(page.getByText("¿Te interesa este servicio?")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Enviar inscripción" })).toHaveCount(0)
  })

  test("WhatsApp activado sin número no muestra un botón roto", async ({ api, page }) => {
    const service = await createService(api, { showWhatsapp: true, whatsapp: "" })
    await page.goto(`/servicios/${service.slug}`)
    await expect(page.getByRole("link", { name: "Contactar por WhatsApp" })).toHaveCount(0)
  })

  test("sin texto en inglés usa el español y el texto por defecto del botón", async ({ api, page, context }) => {
    const title = uniqueTitle("Solo español")
    const service = await createService(api, {
      title: { es: title },
      showRegistration: true,
      registrationUrl: "https://forms.gle/x",
    })
    await setLanguage(context, "en")
    await page.goto(`/servicios/${service.slug}`)
    await expect(page.locator("h1")).toHaveText(title)
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible()
  })

  test("un servicio privado da 404 al público y el admin lo ve con aviso", async ({ api, page, browser }) => {
    const service = await createService(api, { published: false })
    const anonymous = await page.goto(`/servicios/${service.slug}`)
    expect(anonymous?.status()).toBe(404)
    await expect(page.getByText("Página no encontrada")).toBeVisible()

    const adminContext = await browser.newContext()
    await loginBrowser(adminContext)
    const adminPage = await adminContext.newPage()
    const res = await adminPage.goto(`/servicios/${service.slug}`)
    expect(res?.status()).toBe(200)
    await expect(adminPage.getByRole("status").filter({ hasText: "Privado." })).toBeVisible()
    await expect(adminPage.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
    await adminContext.close()
  })

  test("despublicar lo saca de inmediato del sitio público", async ({ api, page }) => {
    const service = await createService(api)
    expect((await page.goto(`/servicios/${service.slug}`))?.status()).toBe(200)
    await api.put(`/api/services/${service.slug}`, { data: { published: false } })
    expect((await page.goto(`/servicios/${service.slug}`))?.status()).toBe(404)
    await api.put(`/api/services/${service.slug}`, { data: { published: true } })
    expect((await page.goto(`/servicios/${service.slug}`))?.status()).toBe(200)
  })

  test("un servicio borrado devuelve 404", async ({ api, page }) => {
    const service = await createService(api)
    await api.delete(`/api/services/${service.slug}`)
    expect((await page.goto(`/servicios/${service.slug}`))?.status()).toBe(404)
  })
})

test.describe("rutas", () => {
  for (const path of ["/servicios/no-existe", "/talleres/no-existe", "/pagina-inventada"]) {
    test(`${path} devuelve 404 con la página propia`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(404)
      await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible()
    })
  }

  test("/taller redirige a la home", async ({ page }) => {
    await page.goto("/taller")
    await expect(page).toHaveURL(/\/$/)
  })

  test("el admin no se indexa", async ({ adminPage }) => {
    await adminPage.goto("/admin")
    await expect(adminPage.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
  })
})

test.describe("páginas legales", () => {
  const titles = {
    privacy: {
      es: "Política de privacidad y tratamiento de datos personales",
      en: "Privacy and personal data policy",
      fr: "Politique de confidentialité et de traitement des données personnelles",
    },
    terms: {
      es: "Términos y condiciones de uso",
      en: "Terms and conditions of use",
      fr: "Conditions générales d'utilisation",
    },
  }

  for (const language of ["es", "en", "fr"] as const) {
    test(`privacidad y términos en ${language} sin marcadores de plantilla`, async ({ page, context }) => {
      await setLanguage(context, language)
      for (const [path, kind] of [
        ["/privacidad", "privacy"],
        ["/terminos", "terms"],
      ] as const) {
        await page.goto(path)
        await expect(page.locator("h1")).toHaveText(titles[kind][language])
        const text = await page.locator("main").innerText()
        expect(text).not.toMatch(/\[(Ingresa|tu |Nombre)/i)
        expect(text).not.toContain("undefined")
        expect(text).not.toContain("Invalid Date")
      }
    })
  }

  test("el footer enlaza ambas páginas y entre ellas se enlazan", async ({ page }) => {
    await page.goto("/privacidad")
    await page.getByRole("link", { name: "Consulta también los términos y condiciones" }).click()
    await expect(page).toHaveURL(/\/terminos$/)
    await page.locator("footer").getByRole("link", { name: "Política de privacidad" }).click()
    await expect(page).toHaveURL(/\/privacidad$/)
  })
})

test.describe("móvil @mobile", () => {
  for (const path of ["/", "/privacidad", "/terminos", "/servicios/no-existe"]) {
    test(`${path} no tiene scroll horizontal @mobile`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(1)
    })
  }

  test("el menú hamburguesa abre, navega y se cierra @mobile-only", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Abrir menú" }).click()
    await page.getByRole("link", { name: "FAQ" }).last().click()
    await expect(page).toHaveURL(/#faq$/)
    await expect(page.getByRole("button", { name: "Abrir menú" })).toBeVisible()
  })
})
