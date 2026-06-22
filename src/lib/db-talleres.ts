import { neon } from "@neondatabase/serverless"
import type { Taller } from "./talleres"

const sql = neon(process.env.POSTGRES_URL!)

let initPromise: Promise<void> | null = null

async function ensureTable() {
  if (!initPromise) {
    initPromise = sql`
      CREATE TABLE IF NOT EXISTS talleres (
        id          TEXT PRIMARY KEY,
        slug        TEXT UNIQUE NOT NULL,
        title       TEXT NOT NULL,
        date        TEXT NOT NULL,
        cost        TEXT NOT NULL,
        excerpt     TEXT NOT NULL,
        cover_image TEXT DEFAULT '',
        blocks      JSONB DEFAULT '[]',
        images      JSONB DEFAULT '[]',
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `.then(() => {}).catch((err) => {
      console.error("Failed to initialize talleres table:", err)
      throw err
    })
  }
  await initPromise
}

function mapRowToTaller(row: Record<string, unknown>): Taller {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    date: row.date as string,
    cost: row.cost as string,
    excerpt: row.excerpt as string,
    coverImage: (row.cover_image as string) || undefined,
    blocks: row.blocks as Taller["blocks"],
    images: row.images as Taller["images"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getAllTalleres(): Promise<Taller[]> {
  await ensureTable()
  const rows = await sql`
    SELECT * FROM talleres ORDER BY date DESC
  `
  return rows.map(mapRowToTaller)
}

export async function getTallerBySlug(slug: string): Promise<Taller | null> {
  await ensureTable()
  const rows = await sql`
    SELECT * FROM talleres WHERE slug = ${slug} LIMIT 1
  `
  return rows.length ? mapRowToTaller(rows[0]) : null
}

export async function saveTaller(taller: Taller): Promise<void> {
  await ensureTable()
  await sql`
    INSERT INTO talleres (id, slug, title, date, cost, excerpt, cover_image, blocks, images, created_at, updated_at)
    VALUES (
      ${taller.id},
      ${taller.slug},
      ${taller.title},
      ${taller.date},
      ${taller.cost},
      ${taller.excerpt},
      ${taller.coverImage ?? ""},
      ${JSON.stringify(taller.blocks)}::jsonb,
      ${JSON.stringify(taller.images)}::jsonb,
      ${taller.createdAt},
      ${taller.updatedAt}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title       = EXCLUDED.title,
      date        = EXCLUDED.date,
      cost        = EXCLUDED.cost,
      excerpt     = EXCLUDED.excerpt,
      cover_image = EXCLUDED.cover_image,
      blocks      = EXCLUDED.blocks,
      images      = EXCLUDED.images,
      updated_at  = EXCLUDED.updated_at
  `
}

export async function deleteTaller(slug: string): Promise<void> {
  await ensureTable()
  await sql`
    DELETE FROM talleres WHERE slug = ${slug}
  `
}
