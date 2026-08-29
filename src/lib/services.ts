import type { LocalizedText } from "./i18n-field"

export interface ServiceImage {
  url: string
  alt?: string
}

export interface ServiceBlock {
  type: "paragraph" | "heading"
  content: LocalizedText
}

export type ServiceCtaType = "whatsapp" | "form"

export interface Service {
  id: string
  slug: string
  /** Línea principal de la card, en mayúsculas */
  title: LocalizedText
  /** Línea secundaria de la card, al lado del separador */
  kicker: LocalizedText
  /** Entradilla de la página de detalle */
  excerpt: LocalizedText
  coverImage?: string
  blocks: ServiceBlock[]
  images: ServiceImage[]
  ctaType: ServiceCtaType
  whatsapp?: string
  waMessage: LocalizedText
  position: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceInput = Omit<Service, "id" | "slug" | "createdAt" | "updatedAt">
