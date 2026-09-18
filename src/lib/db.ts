import { neon } from "@neondatabase/serverless"

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>

type PGliteLike = { query: (text: string, params: unknown[]) => Promise<{ rows: Row[] }> }

/**
 * Postgres en memoria (PGlite) para los tests. Vive en `globalThis` para que
 * las rutas API y las páginas del mismo proceso compartan una sola base.
 */
function createPgliteSql(): Sql {
  const store = globalThis as { __emPglite?: Promise<PGliteLike> }
  const getDb = () =>
    (store.__emPglite ??= import(/* webpackIgnore: true */ "@electric-sql/pglite").then(({ PGlite }) =>
      PGlite.create()
    ) as Promise<PGliteLike>)

  return async (strings, ...values) => {
    const text = strings.reduce((query, part, index) => query + part + (index < values.length ? `$${index + 1}` : ""), "")
    const db = await getDb()
    const result = await db.query(text, values)
    return result.rows
  }
}

/** Cliente SQL del sitio: Neon en producción, PGlite solo si `DB_DRIVER=pglite` (tests). */
export function createSql(): Sql {
  if (process.env.DB_DRIVER === "pglite") return createPgliteSql()
  return neon(process.env.POSTGRES_URL!) as unknown as Sql
}
