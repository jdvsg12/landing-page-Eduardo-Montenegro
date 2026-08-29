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
] as const

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
  }

  const requestedPrefix = (formData.get("prefix") as string | null)?.replace(/^\/+|\/+$/g, "") ?? ""
  const prefix = (ALLOWED_PREFIXES as readonly string[]).includes(requestedPrefix)
    ? requestedPrefix
    : ""

  const pathname = prefix ? `${prefix}/${file.name}` : file.name

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  })

  return NextResponse.json({ url: blob.url })
}
