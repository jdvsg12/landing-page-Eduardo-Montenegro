import {
  coerceLocalizedText,
  emptyLocalizedText,
  sanitizeLocalizedText,
  type LocalizedText,
} from "./i18n-field"

export type ContentBlockType = "heading" | "paragraph" | "image"

export type TextContentBlock = {
  type: "heading" | "paragraph"
  content: LocalizedText
}

export type ImageContentBlock = {
  type: "image"
  url: string
  alt: LocalizedText
}

export type ContentBlock = TextContentBlock | ImageContentBlock

export interface GalleryImage {
  url: string
  alt?: string
}

export function emptyTextBlock(type: "heading" | "paragraph"): TextContentBlock {
  return { type, content: emptyLocalizedText() }
}

export function emptyImageBlock(): ImageContentBlock {
  return { type: "image", url: "", alt: emptyLocalizedText() }
}

export function isImageBlock(block: ContentBlock): block is ImageContentBlock {
  return block.type === "image"
}

export function sanitizeContentBlocks(value: unknown): ContentBlock[] | null {
  if (!Array.isArray(value)) return null
  return value.flatMap((block): ContentBlock[] => {
    if (!block || typeof block !== "object") return []
    const raw = block as Record<string, unknown>
    if (raw.type === "image") {
      if (typeof raw.url !== "string") return []
      const alt =
        typeof raw.alt === "string"
          ? { es: raw.alt }
          : (sanitizeLocalizedText(raw.alt) ?? emptyLocalizedText())
      return [{ type: "image", url: raw.url.trim(), alt }]
    }
    if (raw.type !== "paragraph" && raw.type !== "heading") return []
    const content =
      typeof raw.content === "string"
        ? { es: raw.content }
        : sanitizeLocalizedText(raw.content)
    return content ? [{ type: raw.type, content }] : []
  })
}

/** Si el contenido viejo tenía galería aparte y ningún bloque imagen, las agrega al final. */
export function mergeGalleryIntoBlocks(blocks: ContentBlock[], images: GalleryImage[]): ContentBlock[] {
  if (images.length === 0 || blocks.some(isImageBlock)) return blocks
  return [
    ...blocks,
    ...images
      .filter((image) => image.url?.trim())
      .map((image) => ({
        type: "image" as const,
        url: image.url.trim(),
        alt: coerceLocalizedText(image.alt ?? ""),
      })),
  ]
}

export function galleryFromBlocks(blocks: ContentBlock[]): GalleryImage[] {
  return blocks.flatMap((block) => {
    if (!isImageBlock(block) || !block.url.trim()) return []
    const alt = block.alt.es?.trim()
    return alt ? [{ url: block.url.trim(), alt }] : [{ url: block.url.trim() }]
  })
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  return moveItemTo(items, index, index + direction)
}

export function moveItemTo<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items
  const copy = [...items]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
