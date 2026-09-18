import { z } from "zod"
import type { LocalizedText } from "./i18n-field"
import { SUPPORTED_LANGUAGES } from "./language"
import { translations, type Language } from "./translations"

/**
 * Contenido de la home administrado desde el panel. Cada clave vive como una
 * fila JSONB en `site_content`; si la fila no existe se usan estos defaults,
 * que reproducen los textos originales de `translations.ts`.
 */

export interface HeroContent {
  image: string
  imageAlt: LocalizedText
  title: LocalizedText
  subtitle: LocalizedText
  /** Texto que se desliza en la parte inferior del hero */
  marquee: LocalizedText
}

export interface AboutBlock {
  title: LocalizedText
  /** Párrafos separados por una línea en blanco */
  body: LocalizedText
}

/** Una pantalla del scroll de "Sobre mí": uno o dos bloques que se leen juntos */
export interface AboutScreen {
  blocks: AboutBlock[]
}

export interface AboutContent {
  title: LocalizedText
  screens: AboutScreen[]
}

export interface FaqItem {
  question: LocalizedText
  answer: LocalizedText
}

export interface FaqCategory {
  name: LocalizedText
  items: FaqItem[]
}

export interface FaqContent {
  title: LocalizedText
  categories: FaqCategory[]
}

export interface SeoContent {
  siteName: string
  siteUrl: string
  title: LocalizedText
  description: LocalizedText
  keywords: LocalizedText
  ogImage: string
}

/** Datos del responsable que aparecen en la política de privacidad y los términos */
export interface LegalContent {
  ownerName: string
  documentId: string
  address: string
  email: string
  phone: string
  /** Fecha ISO (YYYY-MM-DD) de la última actualización de los documentos legales */
  updatedAt: string
}

export interface SiteContentMap {
  hero: HeroContent
  about: AboutContent
  faq: FaqContent
  seo: SeoContent
  legal: LegalContent
}

export type SiteContentKey = keyof SiteContentMap

export const SITE_CONTENT_KEYS: SiteContentKey[] = ["hero", "about", "faq", "seo", "legal"]

export function isSiteContentKey(value: string): value is SiteContentKey {
  return (SITE_CONTENT_KEYS as string[]).includes(value)
}

function fromTranslations(pick: (lang: Language) => string): LocalizedText {
  return Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, pick(lang)])) as LocalizedText
}

function splitParagraphs(text: string) {
  return text
    .split("\n\n")
    .map((part) => part.trim())
    .filter(Boolean)
}

/**
 * Reconstruye las pantallas de "Sobre mí" tal como las armaba el componente
 * a partir de `about` y `profile`: primero los pasajes de "Sobre mí", luego
 * los del perfil de a dos, y el cierre ("Te escucho.") como título del último.
 */
function defaultAboutScreens(): AboutScreen[] {
  const perLang = SUPPORTED_LANGUAGES.map((lang) => {
    const t = translations[lang]
    const aboutBlocks = splitParagraphs(t.about.description).map((body, index) => ({
      title: t.about.passageTitles[index] ?? t.about.title,
      body,
    }))

    const profileParts = splitParagraphs(t.profile.description)
    const closingTitle = t.profile.passageTitles.at(-1) ?? ""
    const lastPart = profileParts.at(-1) ?? ""
    const closingIsTitle =
      closingTitle.length > 0 &&
      lastPart.replace(/[.]/g, "").toLowerCase() === closingTitle.replace(/[.]/g, "").toLowerCase()
    const profileBodies = closingIsTitle ? profileParts.slice(0, -1) : profileParts
    const profileBlocks = profileBodies.map((body, index) => ({
      title: t.profile.passageTitles[index] ?? t.profile.title,
      body,
    }))

    const screens = [aboutBlocks]
    for (let index = 0; index < profileBlocks.length; index += 2) {
      screens.push(profileBlocks.slice(index, index + 2))
    }
    return { lang, screens }
  })

  const base = perLang[0].screens
  return base.map((screen, screenIndex) => ({
    blocks: screen.map((_, blockIndex) => ({
      title: Object.fromEntries(
        perLang.map(({ lang, screens }) => [lang, screens[screenIndex]?.[blockIndex]?.title ?? ""])
      ) as LocalizedText,
      body: Object.fromEntries(
        perLang.map(({ lang, screens }) => [lang, screens[screenIndex]?.[blockIndex]?.body ?? ""])
      ) as LocalizedText,
    })),
  }))
}

function defaultFaqCategories(): FaqCategory[] {
  return translations.es.faq.categories.map((category, categoryIndex) => ({
    name: fromTranslations((lang) => translations[lang].faq.categories[categoryIndex]?.name ?? ""),
    items: category.items.map((_, itemIndex) => ({
      question: fromTranslations(
        (lang) => translations[lang].faq.categories[categoryIndex]?.items[itemIndex]?.question ?? ""
      ),
      answer: fromTranslations(
        (lang) => translations[lang].faq.categories[categoryIndex]?.items[itemIndex]?.answer ?? ""
      ),
    })),
  }))
}

export const SITE_CONTENT_DEFAULTS: SiteContentMap = {
  hero: {
    image: "/images/profile.png",
    imageAlt: fromTranslations((lang) => translations[lang].hero.portraitAlt),
    title: fromTranslations((lang) => translations[lang].hero.title),
    subtitle: fromTranslations((lang) => translations[lang].hero.subtitle),
    marquee: { es: "EDUARDO MONTENEGRO", en: "", fr: "" },
  },
  about: {
    title: fromTranslations((lang) => translations[lang].about.title),
    screens: defaultAboutScreens(),
  },
  faq: {
    title: fromTranslations((lang) => translations[lang].faq.title),
    categories: defaultFaqCategories(),
  },
  seo: {
    siteName: "Eduardo Montenegro Flórez",
    siteUrl: "https://www.eduardomontenegroflorez.com",
    title: {
      es: "Eduardo Montenegro Flórez | Psicólogo y Psicoanalista",
      en: "Eduardo Montenegro Flórez | Psychologist and Psychoanalyst",
      fr: "Eduardo Montenegro Flórez | Psychologue et Psychanalyste",
    },
    description: {
      es: "Especialista en Psicopatología y Salud Mental. Acompañamiento en malestar persistente, duelos y experiencias que dejan huella. Ningún sufrimiento es insignificante.",
      en: "Specialist in Psychopathology and Mental Health. Clinical work with persistent distress, mourning and experiences that leave a mark. No suffering is insignificant.",
      fr: "Spécialiste en psychopathologie et santé mentale. Accompagnement du malaise persistant, des deuils et des expériences qui laissent une trace. Aucune souffrance n'est insignifiante.",
    },
    keywords: {
      es: "psicoanalista, psicólogo, psicoanálisis, supervisión clínica, Bogotá, online",
      en: "psychoanalyst, psychologist, psychoanalysis, clinical supervision, online",
      fr: "psychanalyste, psychologue, psychanalyse, supervision clinique, en ligne",
    },
    ogImage: "/image_c4bc3f.jpeg",
  },
  legal: {
    ownerName: "Eduardo Montenegro Flórez",
    documentId: "",
    address: "",
    email: "Contacto@eduardomontenegro.com",
    phone: "+57 314 279 3431",
    updatedAt: "2026-09-10",
  },
}

/* ---------- Validación de lo que llega desde el panel ---------- */

const localized = z
  .object({ es: z.string().max(20000), en: z.string().max(20000), fr: z.string().max(20000) })
  .partial()

const url = z.string().max(2000)

const schemas = {
  hero: z.object({
    image: url,
    imageAlt: localized,
    title: localized,
    subtitle: localized,
    marquee: localized,
  }),
  about: z.object({
    title: localized,
    screens: z
      .array(z.object({ blocks: z.array(z.object({ title: localized, body: localized })).max(6) }))
      .max(20),
  }),
  faq: z.object({
    title: localized,
    categories: z
      .array(
        z.object({
          name: localized,
          items: z.array(z.object({ question: localized, answer: localized })).max(50),
        })
      )
      .max(12),
  }),
  seo: z.object({
    siteName: z.string().max(200),
    siteUrl: url,
    title: localized,
    description: localized,
    keywords: localized,
    ogImage: url,
  }),
  legal: z.object({
    ownerName: z.string().max(200),
    documentId: z.string().max(100),
    address: z.string().max(500),
    email: z.string().max(200),
    phone: z.string().max(100),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
} satisfies { [K in SiteContentKey]: z.ZodType<SiteContentMap[K]> }

export function parseSiteContent<K extends SiteContentKey>(
  key: K,
  value: unknown
): { success: true; data: SiteContentMap[K] } | { success: false; error: string } {
  const result = schemas[key].safeParse(value)
  if (result.success) return { success: true, data: result.data as SiteContentMap[K] }
  const issue = result.error.issues[0]
  return { success: false, error: `${issue.path.join(".") || key}: ${issue.message}` }
}
