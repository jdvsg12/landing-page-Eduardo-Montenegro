import type { Page } from "@playwright/test"
import { expect, resend, setLanguage, test } from "./helpers"

const es = {
  name: "¿Cuál es tu nombre?",
  email: "¿Cuál es tu correo?",
  phone: "¿Cuál es tu teléfono?",
  services: "¿Qué servicios buscas?",
  message: "Tu mensaje",
}

async function openContact(page: Page) {
  await page.goto("/#contact")
  const form = page.locator("#contact form")
  await form.scrollIntoViewIfNeeded()
  return form
}

async function fillValid(page: Page, overrides: Partial<Record<keyof typeof es, string>> = {}) {
  const form = page.locator("#contact form")
  await form.getByLabel(es.name).fill(overrides.name ?? "François Hélène")
  await form.getByLabel(es.email).fill(overrides.email ?? "francois@example.fr")
  await form.getByLabel(es.phone).fill(overrides.phone ?? "310 123 4567")
  await form.getByLabel(es.services).selectOption({ index: 2 })
  await form.getByLabel(es.message).fill(overrides.message ?? "Quisiera información.")
  await form.locator("#terms").check()
}

test.beforeEach(async ({ request }) => {
  await resend.reset(request)
})

test.describe("formulario de contacto", () => {
  test("enviar vacío muestra todos los errores y no llama a la API", async ({ page }) => {
    const form = await openContact(page)
    let apiCalls = 0
    page.on("request", (req) => req.url().includes("/api/contact") && apiCalls++)

    await form.getByRole("button", { name: "Enviar" }).click()

    const summary = form.getByRole("alert").first()
    await expect(summary).toContainText("Por favor corrige los siguientes errores")
    await expect(summary).toContainText("El nombre debe tener al menos 2 caracteres")
    await expect(summary).toContainText("El correo electrónico es obligatorio")
    await expect(summary).toContainText("El teléfono es obligatorio")
    await expect(summary).toContainText("Debes seleccionar un servicio")
    await expect(summary).toContainText("Debes aceptar los términos y condiciones")
    await expect(form.getByLabel(es.email)).toHaveAttribute("aria-invalid", "true")
    expect(apiCalls).toBe(0)
  })

  test("valida formato de correo, nombre y teléfono antes de enviar", async ({ page }) => {
    const form = await openContact(page)
    await fillValid(page, { name: "Ana 123", email: "ana@", phone: "12ab" })
    await form.getByRole("button", { name: "Enviar" }).click()

    const summary = form.getByRole("alert").first()
    await expect(summary).toContainText("El nombre solo puede contener letras")
    await expect(summary).toContainText("Por favor ingresa un correo electrónico válido")
    await expect(summary).toContainText("El teléfono solo puede contener números")
    expect(await resend.emails(page.request)).toHaveLength(0)
  })

  test("sin aceptar términos no se envía", async ({ page }) => {
    const form = await openContact(page)
    await fillValid(page)
    await form.locator("#terms").uncheck()
    await form.getByRole("button", { name: "Enviar" }).click()
    await expect(form.getByRole("alert").first()).toContainText("Debes aceptar los términos y condiciones")
    expect(await resend.emails(page.request)).toHaveLength(0)
  })

  test("un envío válido llega al correo con el HTML escapado y limpia el formulario", async ({ page }) => {
    const form = await openContact(page)
    await fillValid(page, { message: "<script>alert('xss')</script> Hola" })
    await form.getByRole("button", { name: "Enviar" }).click()

    await expect(form.getByRole("status")).toContainText("Mensaje enviado")
    await expect(form.getByLabel(es.name)).toHaveValue("")
    await expect(form.locator("#terms")).not.toBeChecked()

    const emails = await resend.emails(page.request)
    expect(emails).toHaveLength(1)
    expect(emails[0].subject).toBe("Nueva consulta de François Hélène")
    expect(emails[0].to).toBe("inbox@e2e.test")
    expect(emails[0].html).not.toContain("<script>alert")
    expect(emails[0].html).toContain("&lt;script&gt;")
  })

  test("si Resend falla, avisa del error y conserva lo escrito para reintentar", async ({ page }) => {
    const form = await openContact(page)
    await resend.failNext(page.request)
    await fillValid(page)
    await form.getByRole("button", { name: "Enviar" }).click()

    await expect(form.getByRole("alert")).toContainText("No se pudo enviar el mensaje")
    await expect(form.getByRole("status")).toHaveCount(0)
    await expect(form.getByLabel(es.name)).toHaveValue("François Hélène")
  })

  test("si se cae la red, muestra el error en vez de quedarse enviando", async ({ page }) => {
    const form = await openContact(page)
    await page.route("**/api/contact", (route) => route.abort("internetdisconnected"))
    await fillValid(page)
    await form.getByRole("button", { name: "Enviar" }).click()

    await expect(form.getByRole("alert")).toContainText("No se pudo enviar el mensaje")
    await expect(form.getByRole("button", { name: "Enviar" })).toBeEnabled()
  })

  test("un doble clic solo envía una vez", async ({ page }) => {
    const form = await openContact(page)
    let calls = 0
    await page.route("**/api/contact", async (route) => {
      calls++
      await new Promise((resolve) => setTimeout(resolve, 800))
      await route.continue()
    })
    await fillValid(page)
    const button = form.getByRole("button", { name: "Enviar" })
    await button.dblclick()
    await expect(form.getByRole("button", { name: "Enviando..." })).toBeDisabled()
    await expect(form.getByRole("status")).toContainText("Mensaje enviado")
    expect(calls).toBe(1)
  })

  test("en inglés los errores salen en inglés", async ({ page, context }) => {
    await setLanguage(context, "en")
    await page.goto("/#contact")
    const form = page.locator("#contact form")
    await form.getByRole("button", { name: "Send it" }).click()
    await expect(form.getByRole("alert").first()).toContainText("Please correct the following errors")
    await expect(form.getByRole("alert").first()).toContainText("You must accept the terms and conditions")
  })

  test("los enlaces de consentimiento abren términos y privacidad en otra pestaña", async ({ page }) => {
    const form = await openContact(page)
    const label = form.locator("label[for=terms]")
    await expect(label.getByRole("link", { name: "términos y condiciones" })).toHaveAttribute("href", "/terminos")
    await expect(label.getByRole("link", { name: "política de privacidad" })).toHaveAttribute("href", "/privacidad")
    await expect(label.getByRole("link", { name: "política de privacidad" })).toHaveAttribute("target", "_blank")
  })
})

test.describe("API de contacto", () => {
  const valid = {
    name: "Ana Pérez",
    email: "ana@example.com",
    phone: "3101234567",
    services: "Psicoanálisis adulto",
    terms: true,
    language: "es",
  }

  test("valida también en el servidor (no confía en el navegador)", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { ...valid, terms: false, email: "no" } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(Object.keys(body.errors).sort()).toEqual(["email", "terms"])
    expect(await resend.emails(request)).toHaveLength(0)
  })

  test("un idioma desconocido no tumba el servidor", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { ...valid, language: "de" } })
    expect(res.status()).toBe(400)
  })

  test("JSON malformado responde 400", async ({ request }) => {
    const res = await request.post("/api/contact", { headers: { "Content-Type": "application/json" }, data: "{" })
    expect(res.status()).toBe(400)
  })

  test("si el correo falla responde 500 en vez de decir que se envió", async ({ request }) => {
    await resend.failNext(request)
    const res = await request.post("/api/contact", { data: valid })
    expect(res.status()).toBe(500)
  })
})
