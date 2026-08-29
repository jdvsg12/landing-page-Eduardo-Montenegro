import type { Language } from "./translations"

/**
 * Un campo de texto administrado desde el panel, con una versión por idioma.
 * El español es la versión obligatoria y actúa como fallback.
 */
export type LocalizedText = Partial<Record<Language, string>>

export function pickLocale(field: LocalizedText | undefined, lang: Language): string {
  return field?.[lang]?.trim() || field?.es?.trim() || ""
}

export function emptyLocalizedText(): LocalizedText {
  return { es: "", en: "", fr: "" }
}
