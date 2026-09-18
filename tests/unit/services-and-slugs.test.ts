import { describe, expect, it } from "vitest"
import { EMPTY_SERVICE_INPUT, sanitizeExternalUrl, serviceFieldsFromBody, type ServiceInput } from "@/lib/services"
import { titleToSlug } from "@/lib/talleres"
import { pickLocale } from "@/lib/i18n-field"
import { mergeGalleryIntoBlocks, moveItemTo, sanitizeContentBlocks } from "@/lib/content-blocks"

describe("titleToSlug", () => {
  it.each([
    ["Psicoanálisis con adultos", "psicoanalisis-con-adultos"],
    ["¿Qué es un duelo?", "que-es-un-duelo"],
    ["Ñandú & Compañía", "nandu-compania"],
    ["  espacios   múltiples  ", "espacios-multiples"],
    ["Taller -  Duelo", "taller-duelo"],
    ["--guiones--", "guiones"],
  ])("%s → %s", (title, slug) => {
    expect(titleToSlug(title)).toBe(slug)
  })

  it.each(["", "   ", "¿?¡!", "🙂🙂", "---"])("devuelve vacío cuando no hay letras ni números: %j", (title) => {
    expect(titleToSlug(title)).toBe("")
  })
})

describe("pickLocale", () => {
  it("usa el idioma pedido si tiene texto", () => {
    expect(pickLocale({ es: "Hola", en: "Hello" }, "en")).toBe("Hello")
  })

  it("cae al español si el idioma está vacío o solo tiene espacios", () => {
    expect(pickLocale({ es: "Hola", en: "   " }, "en")).toBe("Hola")
    expect(pickLocale({ es: "Hola" }, "fr")).toBe("Hola")
  })

  it("devuelve cadena vacía si no hay nada", () => {
    expect(pickLocale(undefined, "es")).toBe("")
    expect(pickLocale({}, "en")).toBe("")
  })

  it("no revienta si el campo llegó con una forma inesperada", () => {
    expect(pickLocale("texto suelto" as never, "es")).toBe("")
    expect(pickLocale({ es: 42 } as never, "es")).toBe("")
  })
})

describe("sanitizeExternalUrl", () => {
  it.each([
    ["https://forms.gle/wokftp918cnrxchW9", "https://forms.gle/wokftp918cnrxchW9"],
    ["  https://calendar.app.google/abc  ", "https://calendar.app.google/abc"],
    ["http://example.com", "http://example.com/"],
  ])("acepta %s", (input, expected) => {
    expect(sanitizeExternalUrl(input)).toBe(expected)
  })

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com/file",
    "/servicios/relativo",
    "forms.gle/sin-protocolo",
    "",
    "   ",
  ])("rechaza %j", (input) => {
    expect(sanitizeExternalUrl(input)).toBeUndefined()
  })

  it("rechaza valores que no son texto", () => {
    expect(sanitizeExternalUrl(42)).toBeUndefined()
    expect(sanitizeExternalUrl(null)).toBeUndefined()
    expect(sanitizeExternalUrl({ href: "https://x.com" })).toBeUndefined()
  })
})

describe("serviceFieldsFromBody", () => {
  const base: ServiceInput = {
    ...EMPTY_SERVICE_INPUT,
    title: { es: "Supervisión clínica", en: "Clinical supervision" },
    whatsapp: "+573001112233",
    calendarUrl: "https://calendar.app.google/abc",
    showCalendar: true,
    position: 4,
    published: true,
    blocks: [{ type: "paragraph", content: { es: "Texto" } }],
  }

  it("una actualización parcial solo cambia lo que viene (despublicar no borra nada)", () => {
    const result = serviceFieldsFromBody({ published: false }, base)
    expect(result).toEqual({ ...base, published: false })
  })

  it("no interpreta la cadena \"false\" como verdadero", () => {
    expect(serviceFieldsFromBody({ published: "false" }, base).published).toBe(true)
    expect(serviceFieldsFromBody({ showForm: "yes" }, base).showForm).toBe(false)
  })

  it("ignora posiciones que no son números", () => {
    expect(serviceFieldsFromBody({ position: "abc" }, base).position).toBe(4)
    expect(serviceFieldsFromBody({ position: Infinity }, base).position).toBe(4)
    expect(serviceFieldsFromBody({ position: "7" }, base).position).toBe(7)
  })

  it("descarta enlaces peligrosos del calendario y del link de inscripción", () => {
    const result = serviceFieldsFromBody(
      { calendarUrl: "javascript:alert(1)", registrationUrl: "data:text/html,x" },
      base
    )
    expect(result.calendarUrl).toBeUndefined()
    expect(result.registrationUrl).toBeUndefined()
  })

  it("un número de WhatsApp con solo espacios queda vacío", () => {
    expect(serviceFieldsFromBody({ whatsapp: "   " }, base).whatsapp).toBeUndefined()
  })

  it("no acepta un título que no sea un texto por idioma", () => {
    expect(serviceFieldsFromBody({ title: "Hola" }, base).title).toEqual(base.title)
    expect(serviceFieldsFromBody({ title: ["es", "Hola"] }, base).title).toEqual(base.title)
    expect(serviceFieldsFromBody({ title: { es: "Nuevo", de: "Neu", en: 5 } }, base).title).toEqual({ es: "Nuevo" })
  })

  it("filtra bloques e imágenes con forma inválida", () => {
    const result = serviceFieldsFromBody(
      {
        blocks: [
          { type: "heading", content: { es: "Título" } },
          { type: "image", url: "https://img.example/b.jpg", alt: { es: "Foto" } },
          { type: "script", content: { es: "x" } },
          "texto suelto",
          null,
        ],
        images: [{ url: "https://img.example/a.jpg", alt: "A" }, { url: 5 }, "x"],
      },
      base
    )
    expect(result.blocks).toEqual([
      { type: "heading", content: { es: "Título" } },
      { type: "image", url: "https://img.example/b.jpg", alt: { es: "Foto" } },
    ])
    expect(result.images).toEqual([{ url: "https://img.example/a.jpg", alt: "A" }])
  })

  it("si blocks no es una lista, conserva los anteriores", () => {
    expect(serviceFieldsFromBody({ blocks: "nada" }, base).blocks).toEqual(base.blocks)
  })

  it("si no mandan images, las deriva de los bloques imagen", () => {
    const result = serviceFieldsFromBody(
      {
        blocks: [
          { type: "paragraph", content: { es: "Hola" } },
          { type: "image", url: "https://img.example/c.jpg", alt: { es: "C" } },
        ],
      },
      base
    )
    expect(result.images).toEqual([{ url: "https://img.example/c.jpg", alt: "C" }])
  })
})

describe("content blocks", () => {
  it("acepta un párrafo viejo con content en texto plano", () => {
    expect(sanitizeContentBlocks([{ type: "paragraph", content: "Hola" }])).toEqual([
      { type: "paragraph", content: { es: "Hola" } },
    ])
  })

  it("mete la galería al final si no hay bloques imagen", () => {
    expect(
      mergeGalleryIntoBlocks([{ type: "heading", content: { es: "Título" } }], [{ url: "https://x.com/a.jpg", alt: "A" }])
    ).toEqual([
      { type: "heading", content: { es: "Título" } },
      { type: "image", url: "https://x.com/a.jpg", alt: { es: "A" } },
    ])
  })
})

describe("moveItemTo", () => {
  it("mueve un elemento a otra posición", () => {
    expect(moveItemTo(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
  })
})
