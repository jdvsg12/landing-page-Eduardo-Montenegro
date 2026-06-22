export interface TallerImage {
  url: string
  alt?: string
}

export interface TallerBlock {
  type: "paragraph" | "heading"
  content: string
}

export interface Taller {
  id: string
  slug: string
  title: string
  date: string
  cost: string
  excerpt: string
  coverImage?: string
  blocks: TallerBlock[]
  images: TallerImage[]
  createdAt: string
  updatedAt: string
}

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}
