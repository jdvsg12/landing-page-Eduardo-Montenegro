import { neon } from "@neondatabase/serverless"
import type { LocalizedText } from "./i18n-field"
import type { Service } from "./services"

const sql = neon(process.env.POSTGRES_URL!)

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
    coverImage: (row.cover_image as string) || undefined,
    blocks: row.blocks as Service["blocks"],
    images: row.images as Service["images"],
    ctaType: row.cta_type as Service["ctaType"],
    whatsapp: (row.whatsapp as string) || undefined,
    waMessage: row.wa_message as LocalizedText,
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
      id, slug, title, kicker, excerpt, cover_image, blocks, images,
      cta_type, whatsapp, wa_message, position, published, created_at, updated_at
    )
    VALUES (
      ${service.id},
      ${service.slug},
      ${JSON.stringify(service.title)}::jsonb,
      ${JSON.stringify(service.kicker)}::jsonb,
      ${JSON.stringify(service.excerpt)}::jsonb,
      ${service.coverImage ?? ""},
      ${JSON.stringify(service.blocks)}::jsonb,
      ${JSON.stringify(service.images)}::jsonb,
      ${service.ctaType},
      ${service.whatsapp ?? ""},
      ${JSON.stringify(service.waMessage)}::jsonb,
      ${service.position},
      ${service.published},
      ${service.createdAt},
      ${service.updatedAt}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title       = EXCLUDED.title,
      kicker      = EXCLUDED.kicker,
      excerpt     = EXCLUDED.excerpt,
      cover_image = EXCLUDED.cover_image,
      blocks      = EXCLUDED.blocks,
      images      = EXCLUDED.images,
      cta_type    = EXCLUDED.cta_type,
      whatsapp    = EXCLUDED.whatsapp,
      wa_message  = EXCLUDED.wa_message,
      position    = EXCLUDED.position,
      published   = EXCLUDED.published,
      updated_at  = EXCLUDED.updated_at
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
