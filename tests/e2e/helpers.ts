import { test as base, expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test"
import { ADMIN_PASSWORD, BASE_URL, RESEND_MOCK_URL } from "./env"

export { expect }

let counter = 0
/** Título único por test, solo con letras para que valga en cualquier validación de nombre. */
export function uniqueTitle(prefix: string) {
  counter += 1
  const letters = (Date.now() + counter)
    .toString(26)
    .split("")
    .map((c) => String.fromCharCode(97 + parseInt(c, 26)))
    .join("")
  return `${prefix} ${letters}`
}

export function slugOf(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
}

export async function loginApi(request: APIRequestContext) {
  const res = await request.post("/api/admin/login", { data: { password: ADMIN_PASSWORD } })
  expect(res.status(), "login de prueba").toBe(200)
}

/** Deja la sesión de admin en el navegador (la cookie viaja con `page.request`). */
export async function loginBrowser(context: BrowserContext) {
  await loginApi(context.request)
}

export type ServicePayload = Record<string, unknown> & { title: Record<string, string> }

export async function createService(request: APIRequestContext, payload: Partial<ServicePayload> = {}) {
  const title = payload.title ?? { es: uniqueTitle("Servicio") }
  const res = await request.post("/api/services", {
    data: { showWhatsapp: true, whatsapp: "+573001112233", published: true, ...payload, title },
  })
  expect(res.status(), await res.text()).toBe(201)
  return (await res.json()) as { slug: string; title: Record<string, string>; id: string }
}

export async function createTaller(request: APIRequestContext, payload: Record<string, unknown> = {}) {
  const res = await request.post("/api/talleres", {
    data: {
      title: uniqueTitle("Taller"),
      date: "2030-05-20",
      cost: "COP 100.000",
      excerpt: "Un taller de prueba",
      ...payload,
    },
  })
  expect(res.status(), await res.text()).toBe(201)
  return (await res.json()) as { slug: string; title: string }
}

export async function getContent(request: APIRequestContext, key: string) {
  const res = await request.get(`/api/admin/content/${key}`)
  expect(res.status()).toBe(200)
  return res.json()
}

export async function putContent(request: APIRequestContext, key: string, data: unknown) {
  const res = await request.put(`/api/admin/content/${key}`, { data })
  expect(res.status(), await res.text()).toBe(200)
  return res.json()
}

/** Guarda y restaura una sección de contenido para que cada test deje el sitio como estaba. */
export async function withContentRestore<T>(request: APIRequestContext, key: string, run: (original: T) => Promise<void>) {
  const original = (await getContent(request, key)) as T
  try {
    await run(original)
  } finally {
    await putContent(request, key, original)
  }
}

export async function setLanguage(context: BrowserContext, language: "es" | "en" | "fr") {
  await context.addCookies([{ name: "em-language", value: language, url: BASE_URL }])
  await context.addInitScript((lang) => {
    try {
      window.localStorage.setItem("em-language", lang)
    } catch {}
  }, language)
}

export const resend = {
  async reset(request: APIRequestContext) {
    await request.post(`${RESEND_MOCK_URL}/__reset`)
  },
  async failNext(request: APIRequestContext) {
    await request.post(`${RESEND_MOCK_URL}/__fail`)
  },
  async emails(request: APIRequestContext) {
    const res = await request.get(`${RESEND_MOCK_URL}/__emails`)
    return (await res.json()) as { subject: string; to: string; html: string; authorization?: string }[]
  },
}

/** Acepta el `confirm()` nativo la próxima vez que aparezca. */
export function acceptNextDialog(page: Page) {
  page.once("dialog", (dialog) => dialog.accept())
}

export function dismissNextDialog(page: Page) {
  page.once("dialog", (dialog) => dialog.dismiss())
}

/** Test con un `api` ya autenticado como admin (contexto HTTP independiente del navegador). */
export const test = base.extend<{ api: APIRequestContext; adminPage: Page }>({
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: BASE_URL })
    await loginApi(api)
    await use(api)
    await api.dispose()
  },
  adminPage: async ({ page, context }, use) => {
    await loginBrowser(context)
    await use(page)
  },
})
