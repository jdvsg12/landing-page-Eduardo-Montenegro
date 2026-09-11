import { sanitizeLocalizedText, type LocalizedText } from "./i18n-field"

export interface ServiceImage {
  url: string
  alt?: string
}

export interface ServiceBlock {
  type: "paragraph" | "heading"
  content: LocalizedText
}

export interface Service {
  id: string
  slug: string
  /** Línea principal de la card, en mayúsculas */
  title: LocalizedText
  /** Línea secundaria de la card, al lado del separador */
  kicker: LocalizedText
  /** Entradilla de la página de detalle */
  excerpt: LocalizedText
  /** Foto de la card en la home; si falta se usa la portada interna */
  cardImage?: string
  /** Foto de portada de la página interna del servicio */
  coverImage?: string
  blocks: ServiceBlock[]
  images: ServiceImage[]
  /** Acciones del cierre de la página interna; se pueden combinar */
  showWhatsapp: boolean
  whatsapp?: string
  waMessage: LocalizedText
  showForm: boolean
  showCalendar: boolean
  calendarUrl?: string
  showRegistration: boolean
  registrationUrl?: string
  registrationLabel: LocalizedText
  position: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceInput = Omit<Service, "id" | "slug" | "createdAt" | "updatedAt">

/** Solo se aceptan enlaces http(s) para los botones externos. */
export function sanitizeExternalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : undefined
  } catch {
    return undefined
  }
}

function sanitizeBlocks(value: unknown): ServiceBlock[] | null {
  if (!Array.isArray(value)) return null
  return value.flatMap((block) => {
    if (!block || typeof block !== "object") return []
    const { type, content } = block as Record<string, unknown>
    const localized = sanitizeLocalizedText(content)
    return (type === "paragraph" || type === "heading") && localized ? [{ type, content: localized }] : []
  })
}

function sanitizeImages(value: unknown): ServiceImage[] | null {
  if (!Array.isArray(value)) return null
  return value.flatMap((image) => {
    if (!image || typeof image !== "object") return []
    const { url, alt } = image as Record<string, unknown>
    if (typeof url !== "string" || !url.trim()) return []
    return [typeof alt === "string" ? { url: url.trim(), alt } : { url: url.trim() }]
  })
}

/**
 * Normaliza el cuerpo que llega del panel. Lo que falte o tenga una forma
 * inválida conserva el valor de `base`, así una actualización parcial
 * (por ejemplo solo `{ published: false }`) no borra el resto del servicio.
 */
export function serviceFieldsFromBody(
  body: Record<string, unknown>,
  base: ServiceInput
): ServiceInput {
  const localized = (key: keyof ServiceInput, fallback: LocalizedText) =>
    sanitizeLocalizedText(body[key]) ?? fallback
  const bool = (key: keyof ServiceInput, fallback: boolean) =>
    typeof body[key] === "boolean" ? (body[key] as boolean) : fallback
  const link = (key: keyof ServiceInput, fallback: string | undefined) =>
    body[key] !== undefined ? sanitizeExternalUrl(body[key]) : fallback
  const text = (key: keyof ServiceInput, fallback: string | undefined) => {
    const value = body[key]
    if (value === undefined) return fallback
    return typeof value === "string" ? value.trim() || undefined : fallback
  }
  const position = Number(body.position)

  return {
    title: localized("title", base.title),
    kicker: localized("kicker", base.kicker),
    excerpt: localized("excerpt", base.excerpt),
    cardImage: text("cardImage", base.cardImage),
    coverImage: text("coverImage", base.coverImage),
    blocks: sanitizeBlocks(body.blocks) ?? base.blocks,
    images: sanitizeImages(body.images) ?? base.images,
    showWhatsapp: bool("showWhatsapp", base.showWhatsapp),
    whatsapp: text("whatsapp", base.whatsapp),
    waMessage: localized("waMessage", base.waMessage),
    showForm: bool("showForm", base.showForm),
    showCalendar: bool("showCalendar", base.showCalendar),
    calendarUrl: link("calendarUrl", base.calendarUrl),
    showRegistration: bool("showRegistration", base.showRegistration),
    registrationUrl: link("registrationUrl", base.registrationUrl),
    registrationLabel: localized("registrationLabel", base.registrationLabel),
    position: body.position !== undefined && body.position !== "" && Number.isFinite(position) ? position : base.position,
    published: bool("published", base.published),
  }
}

export const EMPTY_SERVICE_INPUT: ServiceInput = {
  title: {},
  kicker: {},
  excerpt: {},
  blocks: [],
  images: [],
  showWhatsapp: true,
  waMessage: {},
  showForm: false,
  showCalendar: false,
  showRegistration: false,
  registrationLabel: {},
  position: 0,
  published: true,
}
