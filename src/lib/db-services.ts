import { createSql } from "./db"
import type { LocalizedText } from "./i18n-field"
import type { Service } from "./services"

const sql = createSql()

let initPromise: Promise<void> | null = null

async function ensureTables() {
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS services (
          id          TEXT PRIMARY KEY,
          slug        TEXT UNIQUE NOT NULL,
          title       JSONB   NOT NULL DEFAULT '{}',
          kicker      JSONB   NOT NULL DEFAULT '{}',
          excerpt     JSONB   NOT NULL DEFAULT '{}',
          cover_image TEXT             DEFAULT '',
          blocks      JSONB   NOT NULL DEFAULT '[]',
          images      JSONB   NOT NULL DEFAULT '[]',
          cta_type    TEXT    NOT NULL DEFAULT 'whatsapp',
          whatsapp    TEXT             DEFAULT '',
          wa_message  JSONB   NOT NULL DEFAULT '{}',
          position    INTEGER NOT NULL DEFAULT 0,
          published   BOOLEAN NOT NULL DEFAULT TRUE,
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          updated_at  TIMESTAMPTZ DEFAULT NOW()
        );
      `
      // Columnas agregadas después: aditivas para que un deploy anterior siga funcionando.
      await sql`
        ALTER TABLE services
          ADD COLUMN IF NOT EXISTS card_image         TEXT  DEFAULT '',
          ADD COLUMN IF NOT EXISTS show_whatsapp      BOOLEAN,
          ADD COLUMN IF NOT EXISTS show_form          BOOLEAN,
          ADD COLUMN IF NOT EXISTS show_calendar      BOOLEAN NOT NULL DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS calendar_url       TEXT  DEFAULT '',
          ADD COLUMN IF NOT EXISTS show_registration  BOOLEAN NOT NULL DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS registration_url   TEXT  DEFAULT '',
          ADD COLUMN IF NOT EXISTS registration_label JSONB NOT NULL DEFAULT '{}'
      `
      // Los servicios creados con el antiguo `cta_type` heredan su botón.
      await sql`
        UPDATE services SET
          show_whatsapp = COALESCE(show_whatsapp, cta_type = 'whatsapp'),
          show_form     = COALESCE(show_form, cta_type = 'form')
        WHERE show_whatsapp IS NULL OR show_form IS NULL
      `
      await sql`
        CREATE TABLE IF NOT EXISTS service_leads (
          id           TEXT PRIMARY KEY,
          service_slug TEXT NOT NULL,
          name         TEXT NOT NULL,
          email        TEXT NOT NULL,
          phone        TEXT,
          message      TEXT,
          created_at   TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })().catch((err) => {
      console.error("Failed to initialize services tables:", err)
      initPromise = null
      throw err
    })
  }
  await initPromise
}

function mapRowToService(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as LocalizedText,
    kicker: row.kicker as LocalizedText,
    excerpt: row.excerpt as LocalizedText,
    cardImage: (row.card_image as string) || undefined,
    coverImage: (row.cover_image as string) || undefined,
    blocks: row.blocks as Service["blocks"],
    images: row.images as Service["images"],
    showWhatsapp: (row.show_whatsapp as boolean | null) ?? row.cta_type === "whatsapp",
    whatsapp: (row.whatsapp as string) || undefined,
    waMessage: row.wa_message as LocalizedText,
    showForm: (row.show_form as boolean | null) ?? row.cta_type === "form",
    showCalendar: Boolean(row.show_calendar),
    calendarUrl: (row.calendar_url as string) || undefined,
    showRegistration: Boolean(row.show_registration),
    registrationUrl: (row.registration_url as string) || undefined,
    registrationLabel: (row.registration_label as LocalizedText) ?? {},
    position: Number(row.position),
    published: Boolean(row.published),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getAllServices(): Promise<Service[]> {
  await ensureTables()
  const rows = await sql`
    SELECT * FROM services ORDER BY position ASC, created_at ASC
  `
  return rows.map(mapRowToService)
}

export async function getPublishedServices(): Promise<Service[]> {
  await ensureTables()
  const rows = await sql`
    SELECT * FROM services WHERE published = TRUE ORDER BY position ASC, created_at ASC
  `
  return rows.map(mapRowToService)
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  await ensureTables()
  const rows = await sql`
    SELECT * FROM services WHERE slug = ${slug} LIMIT 1
  `
  return rows.length ? mapRowToService(rows[0]) : null
}

export async function saveService(service: Service): Promise<void> {
  await ensureTables()
  await sql`
    INSERT INTO services (
      id, slug, title, kicker, excerpt, card_image, cover_image, blocks, images,
      cta_type, show_whatsapp, whatsapp, wa_message, show_form,
      show_calendar, calendar_url, show_registration, registration_url, registration_label,
      position, published, created_at, updated_at
    )
    VALUES (
      ${service.id},
      ${service.slug},
      ${JSON.stringify(service.title)}::jsonb,
      ${JSON.stringify(service.kicker)}::jsonb,
      ${JSON.stringify(service.excerpt)}::jsonb,
      ${service.cardImage ?? ""},
      ${service.coverImage ?? ""},
      ${JSON.stringify(service.blocks)}::jsonb,
      ${JSON.stringify(service.images)}::jsonb,
      ${service.showForm && !service.showWhatsapp ? "form" : "whatsapp"},
      ${service.showWhatsapp},
      ${service.whatsapp ?? ""},
      ${JSON.stringify(service.waMessage)}::jsonb,
      ${service.showForm},
      ${service.showCalendar},
      ${service.calendarUrl ?? ""},
      ${service.showRegistration},
      ${service.registrationUrl ?? ""},
      ${JSON.stringify(service.registrationLabel)}::jsonb,
      ${service.position},
      ${service.published},
      ${service.createdAt},
      ${service.updatedAt}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title              = EXCLUDED.title,
      kicker             = EXCLUDED.kicker,
      excerpt            = EXCLUDED.excerpt,
      card_image         = EXCLUDED.card_image,
      cover_image        = EXCLUDED.cover_image,
      blocks             = EXCLUDED.blocks,
      images             = EXCLUDED.images,
      cta_type           = EXCLUDED.cta_type,
      show_whatsapp      = EXCLUDED.show_whatsapp,
      whatsapp           = EXCLUDED.whatsapp,
      wa_message         = EXCLUDED.wa_message,
      show_form          = EXCLUDED.show_form,
      show_calendar      = EXCLUDED.show_calendar,
      calendar_url       = EXCLUDED.calendar_url,
      show_registration  = EXCLUDED.show_registration,
      registration_url   = EXCLUDED.registration_url,
      registration_label = EXCLUDED.registration_label,
      position           = EXCLUDED.position,
      published          = EXCLUDED.published,
      updated_at         = EXCLUDED.updated_at
  `
}

export async function deleteService(slug: string): Promise<void> {
  await ensureTables()
  await sql`
    DELETE FROM services WHERE slug = ${slug}
  `
}

export interface ServiceLead {
  id: string
  serviceSlug: string
  name: string
  email: string
  phone?: string
  message?: string
}

export interface ServiceLeadRow extends ServiceLead {
  createdAt: string
}

export async function getRecentServiceLeads(limit = 8): Promise<ServiceLeadRow[]> {
  await ensureTables()
  const rows = await sql`
    SELECT * FROM service_leads ORDER BY created_at DESC LIMIT ${limit}
  `
  return rows.map((row) => ({
    id: row.id as string,
    serviceSlug: row.service_slug as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    message: (row.message as string) || undefined,
    createdAt: row.created_at as string,
  }))
}

export async function getServiceLeadCounts(): Promise<{ total: number; last30Days: number }> {
  await ensureTables()
  const [row] = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30
    FROM service_leads
  `
  return { total: Number(row?.total ?? 0), last30Days: Number(row?.last_30 ?? 0) }
}

export async function saveServiceLead(lead: ServiceLead): Promise<void> {
  await ensureTables()
  await sql`
    INSERT INTO service_leads (id, service_slug, name, email, phone, message)
    VALUES (
      ${lead.id},
      ${lead.serviceSlug},
      ${lead.name},
      ${lead.email},
      ${lead.phone ?? ""},
      ${lead.message ?? ""}
    )
  `
}
