import type { Language } from "./translations"
import { pickLocale, sanitizeLocalizedText, type LocalizedText } from "./i18n-field"
import { titleToSlug } from "./slug"
import { type ContentBlock } from "./content-blocks"

export { titleToSlug }

export interface TallerImage {
  url: string
  alt?: string
}

export type TallerBlock = ContentBlock

export interface TallerI18n {
  title?: LocalizedText
  excerpt?: LocalizedText
  cost?: LocalizedText
}

export interface Taller {
  id: string
  slug: string
  title: string
  date: string
  cost: string
  excerpt: string
  /** Traducciones de título, extracto y costo. El español canónico sigue en los campos planos. */
  i18n?: TallerI18n
  coverImage?: string
  blocks: TallerBlock[]
  images: TallerImage[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export function pickTallerText(
  spanish: string,
  localized: LocalizedText | undefined,
  lang: Language
): string {
  return pickLocale({ es: spanish, en: localized?.en, fr: localized?.fr }, lang)
}

export function sanitizeTallerI18n(value: unknown): TallerI18n | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  const raw = value as Record<string, unknown>
  const i18n: TallerI18n = {}
  const title = sanitizeLocalizedText(raw.title)
  const excerpt = sanitizeLocalizedText(raw.excerpt)
  const cost = sanitizeLocalizedText(raw.cost)
  if (title) i18n.title = title
  if (excerpt) i18n.excerpt = excerpt
  if (cost) i18n.cost = cost
  return Object.keys(i18n).length ? i18n : undefined
}
