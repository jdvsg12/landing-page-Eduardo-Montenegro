import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getSession } from "@/lib/auth"

/**
 * Vercel Blob no tiene carpetas: los "directorios" son prefijos en el pathname.
 * Solo se aceptan prefijos conocidos para no dejar que el cliente escriba
 * en cualquier ruta del store.
 */
const ALLOWED_PREFIXES = [
  "services/covers",
  "services/blocks",
  "talleres/covers",
  "talleres/blocks",
  "site/hero",
  "site/seo",
] as const

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")

  if (!formData || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
  }

  // Solo imágenes: el store es público y no debe servir HTML, SVG con scripts ni ejecutables.
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG, WebP, AVIF o GIF" }, { status: 415 })
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen supera el máximo de 8 MB" }, { status: 413 })
  }

  const requestedPrefix = (formData.get("prefix") as string | null)?.replace(/^\/+|\/+$/g, "") ?? ""
  const prefix = (ALLOWED_PREFIXES as readonly string[]).includes(requestedPrefix)
    ? requestedPrefix
    : ""

  const safeName = file.name.replace(/[^\w.-]+/g, "-").replace(/^-+/, "") || "imagen"
  const pathname = prefix ? `${prefix}/${safeName}` : safeName

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  })

  return NextResponse.json({ url: blob.url })
}
