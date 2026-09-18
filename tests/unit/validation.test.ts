import { describe, expect, it } from "vitest"
import { createContactFormSchema, createServiceLeadSchema, formatZodErrors } from "@/lib/validation"
import { translations } from "@/lib/translations"

const validContact = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+57 (310) 123-4567",
  services: "Psicoanálisis con adultos",
  message: "",
  terms: true,
  language: "es",
}

function errorsFor(body: Record<string, unknown>, lang: "es" | "en" | "fr" = "es") {
  const result = createContactFormSchema(lang).safeParse(body)
  return result.success ? {} : formatZodErrors(result.error)
}

describe("formulario de contacto", () => {
  it("acepta un envío válido con teléfono en formato internacional", () => {
    expect(errorsFor(validContact)).toEqual({})
  })

  it.each([
    ["María-José", "nombre compuesto con guion"],
    ["Dolores O'Neil", "apóstrofo"],
    ["François Hélène", "acentos franceses (el sitio está en francés)"],
    ["Zoë Güiza", "diéresis"],
    ["Ñandú Núñez", "eñe y tildes"],
  ])("acepta nombres reales: %s (%s)", (name) => {
    expect(errorsFor({ ...validContact, name })).toEqual({})
  })

  it.each([
    ["Ana123", "números"],
    ["<script>", "etiquetas HTML"],
    ["A", "un solo carácter"],
    ["a".repeat(101), "más de 100 caracteres"],
    ["   ", "solo espacios"],
  ])("rechaza el nombre %s (%s)", (name) => {
    expect(errorsFor({ ...validContact, name })).toHaveProperty("name")
  })

  it("rechaza el correo vacío con el mensaje de obligatorio, no el de formato", () => {
    expect(errorsFor({ ...validContact, email: "" }).email).toBe(translations.es.contact.validation.emailRequired)
  })

  it.each(["ana@", "ana@@example.com", "ana example.com", `${"a".repeat(250)}@example.com`])(
    "rechaza el correo inválido %s",
    (email) => {
      expect(errorsFor({ ...validContact, email })).toHaveProperty("email")
    }
  )

  it.each([
    ["310 12a 4567", "letras"],
    ["123456", "menos de 7 dígitos"],
    ["1234567890123456", "más de 15 dígitos"],
    ["+++---()", "solo símbolos"],
  ])("rechaza el teléfono %s (%s)", (phone) => {
    expect(errorsFor({ ...validContact, phone })).toHaveProperty("phone")
  })

  it("exige elegir un servicio", () => {
    expect(errorsFor({ ...validContact, services: "" })).toHaveProperty("services")
  })

  it("acepta un mensaje de 1000 caracteres y rechaza uno de 1001", () => {
    expect(errorsFor({ ...validContact, message: "x".repeat(1000) })).toEqual({})
    expect(errorsFor({ ...validContact, message: "x".repeat(1001) })).toHaveProperty("message")
  })

  it("exige aceptar términos y privacidad", () => {
    expect(errorsFor({ ...validContact, terms: false })).toHaveProperty("terms")
    expect(errorsFor({ ...validContact, terms: "true" })).toHaveProperty("terms")
  })

  it("devuelve los mensajes en el idioma del visitante", () => {
    expect(errorsFor({ ...validContact, terms: false }, "en").terms).toBe(translations.en.contact.validation.termsRequired)
    expect(errorsFor({ ...validContact, terms: false }, "fr").terms).toBe(translations.fr.contact.validation.termsRequired)
  })

  it("rechaza un idioma que el sitio no soporta", () => {
    expect(errorsFor({ ...validContact, language: "de" })).toHaveProperty("language")
  })

  it("reporta varios campos inválidos a la vez", () => {
    const errors = errorsFor({ name: "", email: "x", phone: "", services: "", terms: false })
    expect(Object.keys(errors).sort()).toEqual(["email", "name", "phone", "services", "terms"])
  })
})

describe("formulario de inscripción a un servicio", () => {
  const validLead = { name: "Hélène Dupont", email: "h@example.fr", phone: "+33 6 12 34 56 78", message: "", terms: true }

  it("acepta una inscripción válida con nombre francés", () => {
    expect(createServiceLeadSchema("fr").safeParse(validLead).success).toBe(true)
  })

  it("rechaza la inscripción sin aceptar términos", () => {
    expect(createServiceLeadSchema("es").safeParse({ ...validLead, terms: false }).success).toBe(false)
  })

  it("rechaza un mensaje demasiado largo", () => {
    expect(createServiceLeadSchema("es").safeParse({ ...validLead, message: "x".repeat(1001) }).success).toBe(false)
  })
})
