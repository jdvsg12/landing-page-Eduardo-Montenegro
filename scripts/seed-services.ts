/**
 * Migra los servicios que vivían en src/lib/translations.ts a la tabla `services`.
 *
 *   npx tsx scripts/seed-services.ts
 *
 * Es idempotente: `saveService` hace UPSERT por slug, así que volver a correrlo
 * reescribe el contenido migrado sin duplicar filas. Los servicios que ya fueron
 * editados desde /admin se saltan salvo que se pase --force.
 */
import fs from "node:fs"
import path from "node:path"
import type { LocalizedText } from "../src/lib/i18n-field"

function loadEnvLocal() {
  if (process.env.POSTGRES_URL) return

  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) {
    throw new Error("No se encontró .env.local ni POSTGRES_URL en el entorno")
  }

  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "")
  }
}

const LANGS = ["es", "en", "fr"] as const
type Lang = (typeof LANGS)[number]

/** Los servicios que llevan formulario en vez de WhatsApp, por su posición en el array. */
const FORM_CTA_INDEXES = new Set([2]) // Grupo de estudio / Study Group / Groupe d'étude

async function main() {
  loadEnvLocal()

  const force = process.argv.includes("--force")

  const { translations } = await import("../src/lib/translations")
  const { titleToSlug } = await import("../src/lib/talleres")
  const { saveService, getServiceBySlug } = await import("../src/lib/db-services")
  const { emptyLocalizedText } = await import("../src/lib/i18n-field")

  const esItems = translations.es.services.items
  const now = new Date().toISOString()

  for (let index = 0; index < esItems.length; index++) {
    const slug = titleToSlug(esItems[index].title)

    const existing = await getServiceBySlug(slug)
    if (existing && !force) {
      console.log(`↷ ${slug} ya existe, se omite (usa --force para sobrescribir)`)
      continue
    }

    const title: LocalizedText = emptyLocalizedText()
    const excerpt: LocalizedText = emptyLocalizedText()
    const waMessage: LocalizedText = emptyLocalizedText()
    const blocksByLang: Record<Lang, string[]> = { es: [], en: [], fr: [] }
    let whatsapp = ""

    for (const lang of LANGS) {
      const item = translations[lang].services.items[index] as {
        title: string
        description: string
        whatsapp?: string
        message?: string
      }
      if (!item) continue

      const paragraphs = item.description
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean)

      title[lang] = item.title
      excerpt[lang] = paragraphs[0] ?? ""
      blocksByLang[lang] = paragraphs.slice(1)
      waMessage[lang] = item.message ?? ""
      if (item.whatsapp) whatsapp = item.whatsapp
    }

    // Los bloques se alinean por posición; el español define cuántos hay.
    const blockCount = blocksByLang.es.length
    const blocks = Array.from({ length: blockCount }, (_, i) => ({
      type: "paragraph" as const,
      content: {
        es: blocksByLang.es[i] ?? "",
        en: blocksByLang.en[i] ?? "",
        fr: blocksByLang.fr[i] ?? "",
      },
    }))

    const ctaType = FORM_CTA_INDEXES.has(index) ? ("form" as const) : ("whatsapp" as const)

    await saveService({
      id: existing?.id ?? crypto.randomUUID(),
      slug,
      title,
      kicker: emptyLocalizedText(),
      excerpt,
      coverImage: undefined,
      blocks,
      images: [],
      ctaType,
      whatsapp: ctaType === "whatsapp" ? whatsapp : undefined,
      waMessage,
      position: index,
      published: true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    })

    console.log(`✔ ${slug} (${ctaType}, ${blocks.length} bloques)`)
  }

  console.log("\nListo. Falta subir portadas y escribir las bajadas desde /admin.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
