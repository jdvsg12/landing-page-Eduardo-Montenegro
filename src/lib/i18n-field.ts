import type { Language } from "./translations"

/**
 * Un campo de texto administrado desde el panel, con una versión por idioma.
 * El español es la versión obligatoria y actúa como fallback.
 */
export type LocalizedText = Partial<Record<Language, string>>

function textOf(field: LocalizedText | undefined, lang: Language): string {
  const value = field && typeof field === "object" ? field[lang] : undefined
  return typeof value === "string" ? value.trim() : ""
}

export function pickLocale(field: LocalizedText | undefined, lang: Language): string {
  return textOf(field, lang) || textOf(field, "es")
}

/** Deja solo los idiomas soportados con valor de texto; cualquier otra forma devuelve `null`. */
export function sanitizeLocalizedText(value: unknown): LocalizedText | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const result: LocalizedText = {}
  for (const lang of ["es", "en", "fr"] as const) {
    const text = (value as Record<string, unknown>)[lang]
    if (typeof text === "string") result[lang] = text
  }
  return result
}

export function emptyLocalizedText(): LocalizedText {
  return { es: "", en: "", fr: "" }
}

/** Acepta el objeto por idioma o un texto suelto (contenido viejo). */
export function coerceLocalizedText(value: unknown): LocalizedText {
  if (typeof value === "string") return { es: value }
  return sanitizeLocalizedText(value) ?? emptyLocalizedText()
}

export function mergeLocalized(
  current: LocalizedText,
  patch: Partial<Record<Language, string>>
): LocalizedText {
  return { ...current, ...patch }
}
