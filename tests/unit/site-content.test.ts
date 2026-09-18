import { describe, expect, it } from "vitest"
import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  isSiteContentKey,
  parseSiteContent,
} from "@/lib/site-content"
import { getLegalDocuments } from "@/lib/legal-documents"
import { SUPPORTED_LANGUAGES } from "@/lib/language"

describe("valores por defecto", () => {
  it("reproducen las tres pantallas originales de Sobre mí (2, 2 y 1 bloques)", () => {
    expect(SITE_CONTENT_DEFAULTS.about.screens.map((screen) => screen.blocks.length)).toEqual([2, 2, 1])
  })

  it("el cierre 'Te escucho.' es título del último bloque y no un párrafo repetido", () => {
    const last = SITE_CONTENT_DEFAULTS.about.screens.at(-1)!.blocks.at(-1)!
    expect(last.title).toMatchObject({ es: "Te escucho.", en: "I listen.", fr: "Je vous écoute." })
    expect(last.body.es).toMatch(/^Concibo el espacio analítico/)
    expect(last.body.es).not.toContain("Te escucho")
  })

  it("cada bloque de Sobre mí y cada pregunta del FAQ tiene texto en los tres idiomas", () => {
    for (const screen of SITE_CONTENT_DEFAULTS.about.screens) {
      for (const block of screen.blocks) {
        for (const lang of SUPPORTED_LANGUAGES) {
          expect(block.title[lang]?.trim(), `about ${lang}`).toBeTruthy()
          expect(block.body[lang]?.trim(), `about ${lang}`).toBeTruthy()
        }
      }
    }
    for (const category of SITE_CONTENT_DEFAULTS.faq.categories) {
      for (const item of category.items) {
        for (const lang of SUPPORTED_LANGUAGES) {
          expect(item.question[lang]?.trim()).toBeTruthy()
          expect(item.answer[lang]?.trim()).toBeTruthy()
        }
      }
    }
  })

  it("el FAQ conserva sus 3 categorías y 13 preguntas", () => {
    expect(SITE_CONTENT_DEFAULTS.faq.categories.map((c) => c.items.length)).toEqual([5, 4, 4])
  })

  it("todos los valores por defecto pasan su propia validación", () => {
    for (const key of SITE_CONTENT_KEYS) {
      expect(parseSiteContent(key, SITE_CONTENT_DEFAULTS[key]).success, key).toBe(true)
    }
  })
})

describe("isSiteContentKey", () => {
  it.each(["hero", "about", "faq", "seo", "legal"])("acepta %s", (key) => {
    expect(isSiteContentKey(key)).toBe(true)
  })

  it.each(["__proto__", "constructor", "toString", "HERO", "", "services"])("rechaza %j", (key) => {
    expect(isSiteContentKey(key)).toBe(false)
  })
})

describe("parseSiteContent", () => {
  it.each([null, undefined, "texto", 42, [], true])("rechaza un cuerpo que no es un objeto: %j", (value) => {
    expect(parseSiteContent("hero", value).success).toBe(false)
  })

  it("rechaza tipos equivocados e indica el campo", () => {
    const result = parseSiteContent("hero", { ...SITE_CONTENT_DEFAULTS.hero, image: 1 })
    expect(result).toMatchObject({ success: false })
    expect(!result.success && result.error).toContain("image")
  })

  it("rechaza un hero sin campos obligatorios", () => {
    expect(parseSiteContent("hero", { image: "/x.png" }).success).toBe(false)
  })

  it("descarta idiomas y campos que el sitio no conoce en lugar de guardarlos", () => {
    const result = parseSiteContent("hero", {
      ...SITE_CONTENT_DEFAULTS.hero,
      title: { es: "Hola", de: "Hallo" },
      injected: "<script>",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toEqual({ es: "Hola" })
      expect(result.data).not.toHaveProperty("injected")
    }
  })

  it("limita la cantidad de categorías y preguntas del FAQ", () => {
    const category = { name: { es: "C" }, items: [{ question: { es: "Q" }, answer: { es: "A" } }] }
    expect(parseSiteContent("faq", { title: {}, categories: Array(13).fill(category) }).success).toBe(false)
    expect(
      parseSiteContent("faq", { title: {}, categories: [{ ...category, items: Array(51).fill(category.items[0]) }] })
        .success
    ).toBe(false)
  })

  it("rechaza textos gigantes", () => {
    const result = parseSiteContent("hero", { ...SITE_CONTENT_DEFAULTS.hero, subtitle: { es: "x".repeat(20001) } })
    expect(result.success).toBe(false)
  })

  it.each(["", "10/09/2026", "2026-9-1", "ayer"])("rechaza la fecha legal %j", (updatedAt) => {
    expect(parseSiteContent("legal", { ...SITE_CONTENT_DEFAULTS.legal, updatedAt }).success).toBe(false)
  })

  it("acepta Sobre mí sin pantallas (sección vacía) y FAQ sin categorías", () => {
    expect(parseSiteContent("about", { title: { es: "Sobre mí" }, screens: [] }).success).toBe(true)
    expect(parseSiteContent("faq", { title: { es: "FAQ" }, categories: [] }).success).toBe(true)
  })
})

describe("documentos legales", () => {
  const siteUrl = "https://www.eduardomontenegroflorez.com/"

  it.each(["privacy", "terms"] as const)("%s tiene las mismas secciones en los tres idiomas", (kind) => {
    const docs = getLegalDocuments(kind, SITE_CONTENT_DEFAULTS.legal, siteUrl)
    const counts = SUPPORTED_LANGUAGES.map((lang) => docs[lang].sections.length)
    expect(new Set(counts).size).toBe(1)
  })

  it("no publica marcadores de plantilla ni campos vacíos del responsable", () => {
    for (const kind of ["privacy", "terms"] as const) {
      const docs = getLegalDocuments(kind, { ...SITE_CONTENT_DEFAULTS.legal, documentId: "", address: "  " }, siteUrl)
      for (const lang of SUPPORTED_LANGUAGES) {
        const text = JSON.stringify(docs[lang])
        expect(text).not.toMatch(/\[(Ingresa|tu |Nombre|Email)/i)
        expect(text).not.toMatch(/Documento de identidad|ID document|Pièce d'identité/)
        expect(text).not.toMatch(/Domicilio|"Address"|"Adresse"/)
      }
    }
  })

  it("muestra documento y domicilio cuando están diligenciados", () => {
    const docs = getLegalDocuments(
      "privacy",
      { ...SITE_CONTENT_DEFAULTS.legal, documentId: "C.C. 123", address: "Bogotá" },
      siteUrl
    )
    expect(docs.es.sections[0].items).toContainEqual(["Documento de identidad", "C.C. 123"])
    expect(docs.es.sections[0].items).toContainEqual(["Domicilio", "Bogotá"])
  })

  it("usa el correo de Ajustes para ejercer derechos y el dominio sin protocolo", () => {
    const docs = getLegalDocuments("privacy", { ...SITE_CONTENT_DEFAULTS.legal, email: "legal@example.com" }, siteUrl)
    const text = JSON.stringify(docs.es)
    expect(text).toContain("legal@example.com")
    expect(text).toContain("www.eduardomontenegroflorez.com")
    expect(text).not.toContain("https://www.eduardomontenegroflorez.com")
  })

  it("los plazos legales de Ley 1581 están bien citados (10+5 consultas, 15+8 reclamos)", () => {
    const text = JSON.stringify(getLegalDocuments("privacy", SITE_CONTENT_DEFAULTS.legal, siteUrl).es)
    expect(text).toContain("diez (10) días hábiles")
    expect(text).toContain("cinco (5) días hábiles")
    expect(text).toContain("quince (15) días hábiles")
    expect(text).toContain("ocho (8) días hábiles")
  })
})
