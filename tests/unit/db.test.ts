import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Service } from "@/lib/services"
import { EMPTY_SERVICE_INPUT } from "@/lib/services"
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content"

/** Cada test arranca con un Postgres vacío y módulos sin caché de `ensureTables`. */
beforeEach(() => {
  delete (globalThis as { __emPglite?: unknown }).__emPglite
  vi.resetModules()
})

async function rawSql() {
  const { createSql } = await import("@/lib/db")
  return createSql()
}

function service(overrides: Partial<Service> = {}): Service {
  const now = new Date().toISOString()
  return {
    ...EMPTY_SERVICE_INPUT,
    id: crypto.randomUUID(),
    slug: "servicio",
    title: { es: "Servicio" },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe("adaptador PGlite", () => {
  it("nunca usa Neon en los tests", () => {
    expect(process.env.DB_DRIVER).toBe("pglite")
  })

  it("pasa valores como parámetros, no concatenados (sin inyección SQL)", async () => {
    const sql = await rawSql()
    await sql`CREATE TABLE t (v TEXT)`
    const evil = "x'); DROP TABLE t; --"
    await sql`INSERT INTO t (v) VALUES (${evil})`
    expect(await sql`SELECT v FROM t`).toEqual([{ v: evil }])
  })
})

describe("site_content", () => {
  it("sin filas devuelve los textos por defecto", async () => {
    const { getSiteContents } = await import("@/lib/db-content")
    const content = await getSiteContents(["hero", "faq"])
    expect(content.hero).toEqual(SITE_CONTENT_DEFAULTS.hero)
    expect(content.faq).toEqual(SITE_CONTENT_DEFAULTS.faq)
  })

  it("guarda, sobrescribe y lee una sección", async () => {
    const { getSiteContent, saveSiteContent } = await import("@/lib/db-content")
    await saveSiteContent("hero", { ...SITE_CONTENT_DEFAULTS.hero, title: { es: "Uno" } })
    await saveSiteContent("hero", { ...SITE_CONTENT_DEFAULTS.hero, title: { es: "Dos" } })
    expect((await getSiteContent("hero")).title).toEqual({ es: "Dos" })
  })

  it("completa con defaults los campos que falten en una fila vieja", async () => {
    const { getSiteContent } = await import("@/lib/db-content")
    await getSiteContent("hero")
    const sql = await rawSql()
    await sql`INSERT INTO site_content (key, data) VALUES ('hero', ${JSON.stringify({ title: { es: "Solo título" } })}::jsonb)`
    const hero = await getSiteContent("hero")
    expect(hero.title).toEqual({ es: "Solo título" })
    expect(hero.marquee).toEqual(SITE_CONTENT_DEFAULTS.hero.marquee)
  })

  it("si la fila está corrupta (no es un objeto) usa los defaults", async () => {
    const { getSiteContent } = await import("@/lib/db-content")
    await getSiteContent("seo")
    const sql = await rawSql()
    await sql`INSERT INTO site_content (key, data) VALUES ('seo', '"texto"'::jsonb)`
    expect(await getSiteContent("seo")).toEqual(SITE_CONTENT_DEFAULTS.seo)
  })

  it("si la base falla, la página sigue con los defaults en vez de romperse", async () => {
    const { getSiteContents } = await import("@/lib/db-content")
    ;(globalThis as { __emPglite?: unknown }).__emPglite = Promise.resolve({
      query: async () => {
        throw new Error("conexión caída")
      },
    })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect((await getSiteContents(["about"])).about).toEqual(SITE_CONTENT_DEFAULTS.about)
    spy.mockRestore()
  })
})

describe("servicios", () => {
  it("migra el esquema viejo: cada servicio hereda su botón de cta_type", async () => {
    const sql = await rawSql()
    await sql`
      CREATE TABLE services (
        id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
        title JSONB NOT NULL DEFAULT '{}', kicker JSONB NOT NULL DEFAULT '{}', excerpt JSONB NOT NULL DEFAULT '{}',
        cover_image TEXT DEFAULT '', blocks JSONB NOT NULL DEFAULT '[]', images JSONB NOT NULL DEFAULT '[]',
        cta_type TEXT NOT NULL DEFAULT 'whatsapp', whatsapp TEXT DEFAULT '', wa_message JSONB NOT NULL DEFAULT '{}',
        position INTEGER NOT NULL DEFAULT 0, published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    await sql`INSERT INTO services (id, slug, cta_type, position) VALUES ('1', 'grupo', 'form', 1), ('2', 'analisis', 'whatsapp', 0)`

    const { getAllServices } = await import("@/lib/db-services")
    const [analisis, grupo] = await getAllServices()
    expect(analisis).toMatchObject({ slug: "analisis", showWhatsapp: true, showForm: false, showCalendar: false })
    expect(grupo).toMatchObject({ slug: "grupo", showWhatsapp: false, showForm: true, registrationLabel: {} })
  })

  it("la migración es idempotente y no pisa lo que ya se editó", async () => {
    const { getAllServices, saveService } = await import("@/lib/db-services")
    await saveService(service({ showWhatsapp: false, showForm: false }))
    vi.resetModules()
    const again = await import("@/lib/db-services")
    expect((await again.getAllServices())[0]).toMatchObject({ showWhatsapp: false, showForm: false })
    expect(await getAllServices()).toHaveLength(1)
  })

  it("los privados no salen en el listado público pero siguen existiendo", async () => {
    const { getAllServices, getPublishedServices, getServiceBySlug, saveService } = await import("@/lib/db-services")
    await saveService(service({ slug: "publico", position: 1 }))
    await saveService(service({ slug: "privado", position: 0, published: false }))
    expect((await getPublishedServices()).map((s) => s.slug)).toEqual(["publico"])
    expect((await getAllServices()).map((s) => s.slug)).toEqual(["privado", "publico"])
    expect(await getServiceBySlug("privado")).toMatchObject({ published: false })
  })

  it("guarda cta_type coherente para que el deploy anterior siga mostrando el botón correcto", async () => {
    const { saveService } = await import("@/lib/db-services")
    await saveService(service({ slug: "solo-form", showForm: true, showWhatsapp: false }))
    await saveService(service({ slug: "ambos", showForm: true, showWhatsapp: true }))
    const sql = await rawSql()
    const rows = await sql`SELECT slug, cta_type FROM services ORDER BY slug`
    expect(rows).toEqual([
      { slug: "ambos", cta_type: "whatsapp" },
      { slug: "solo-form", cta_type: "form" },
    ])
  })

  it("un servicio inexistente devuelve null", async () => {
    const { getServiceBySlug } = await import("@/lib/db-services")
    expect(await getServiceBySlug("no-existe")).toBeNull()
  })

  it("cuenta inscripciones totales y de los últimos 30 días", async () => {
    const { getServiceLeadCounts, getRecentServiceLeads, saveServiceLead } = await import("@/lib/db-services")
    expect(await getServiceLeadCounts()).toEqual({ total: 0, last30Days: 0 })
    await saveServiceLead({ id: "a", serviceSlug: "grupo", name: "Ana", email: "a@x.co" })
    const sql = await rawSql()
    await sql`INSERT INTO service_leads (id, service_slug, name, email, created_at) VALUES ('b', 'grupo', 'Viejo', 'v@x.co', NOW() - INTERVAL '40 days')`
    expect(await getServiceLeadCounts()).toEqual({ total: 2, last30Days: 1 })
    expect((await getRecentServiceLeads(1)).map((lead) => lead.name)).toEqual(["Ana"])
  })
})

describe("talleres", () => {
  it("migra la tabla vieja: los talleres existentes quedan públicos", async () => {
    const sql = await rawSql()
    await sql`
      CREATE TABLE talleres (
        id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, date TEXT NOT NULL,
        cost TEXT NOT NULL, excerpt TEXT NOT NULL, cover_image TEXT DEFAULT '',
        blocks JSONB DEFAULT '[]', images JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    await sql`INSERT INTO talleres (id, slug, title, date, cost, excerpt) VALUES ('1', 'duelo', 'Duelo', '2026-10-01', 'Gratis', 'x')`
    const { getPublishedTalleres } = await import("@/lib/db-talleres")
    expect(await getPublishedTalleres()).toMatchObject([{ slug: "duelo", published: true }])
  })

  it("ordena por fecha descendente y oculta los privados del público", async () => {
    const { getAllTalleres, getPublishedTalleres, saveTaller } = await import("@/lib/db-talleres")
    const base = { cost: "Gratis", excerpt: "x", blocks: [], images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await saveTaller({ ...base, id: "1", slug: "viejo", title: "Viejo", date: "2025-01-01", published: true })
    await saveTaller({ ...base, id: "2", slug: "nuevo", title: "Nuevo", date: "2026-12-01", published: true })
    await saveTaller({ ...base, id: "3", slug: "oculto", title: "Oculto", date: "2026-06-01", published: false })
    expect((await getAllTalleres()).map((t) => t.slug)).toEqual(["nuevo", "oculto", "viejo"])
    expect((await getPublishedTalleres()).map((t) => t.slug)).toEqual(["nuevo", "viejo"])
  })
})
