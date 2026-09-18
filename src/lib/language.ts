import type { Language } from "@/lib/translations"

export const LANGUAGE_COOKIE = "em-language"
export const SUPPORTED_LANGUAGES: Language[] = ["es", "en", "fr"]

export function parseLanguage(value: string | undefined | null): Language {
    if (value === "en" || value === "fr" || value === "es") return value
    return "es"
}

export function languageToHtmlLang(language: Language): string {
    if (language === "en") return "en"
    if (language === "fr") return "fr"
    return "es"
}

export function dateLocale(language: Language): string {
    if (language === "en") return "en-US"
    if (language === "fr") return "fr-FR"
    return "es-CO"
}
