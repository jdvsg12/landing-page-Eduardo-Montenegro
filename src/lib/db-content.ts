import { createSql } from "./db"
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContentKey,
  type SiteContentMap,
} from "./site-content"

const sql = createSql()

let initPromise: Promise<void> | null = null

async function ensureTable() {
  if (!initPromise) {
    initPromise = sql`
      CREATE TABLE IF NOT EXISTS site_content (
        key        TEXT PRIMARY KEY,
        data       JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
      .then(() => {})
      .catch((err) => {
        console.error("Failed to initialize site_content table:", err)
        initPromise = null
        throw err
      })
  }
  await initPromise
}

function withDefaults<K extends SiteContentKey>(key: K, stored: unknown): SiteContentMap[K] {
  const defaults = SITE_CONTENT_DEFAULTS[key]
  if (!stored || typeof stored !== "object") return defaults
  return { ...defaults, ...(stored as Partial<SiteContentMap[K]>) }
}

/** Lee varias claves en una sola consulta. Si la base falla, la web sigue con los textos por defecto. */
export async function getSiteContents<K extends SiteContentKey>(
  keys: K[]
): Promise<Pick<SiteContentMap, K>> {
  const result = Object.fromEntries(keys.map((key) => [key, SITE_CONTENT_DEFAULTS[key]])) as Pick<
    SiteContentMap,
    K
  >

  try {
    await ensureTable()
    const rows = await sql`SELECT key, data FROM site_content WHERE key = ANY(${keys})`
    for (const row of rows) {
      const key = row.key as K
      result[key] = withDefaults(key, row.data)
    }
  } catch (err) {
    console.error("Failed to load site content:", err)
  }

  return result
}

export async function getSiteContent<K extends SiteContentKey>(key: K): Promise<SiteContentMap[K]> {
  const contents = await getSiteContents([key])
  return contents[key]
}

export async function saveSiteContent<K extends SiteContentKey>(
  key: K,
  data: SiteContentMap[K]
): Promise<void> {
  await ensureTable()
  await sql`
    INSERT INTO site_content (key, data, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET
      data       = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at
  `
}
