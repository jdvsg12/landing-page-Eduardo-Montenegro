import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getTallerBySlug, saveTaller, deleteTaller } from "@/lib/db-talleres"
import { getSession } from "@/lib/auth"
import { galleryFromBlocks, sanitizeContentBlocks } from "@/lib/content-blocks"
import { sanitizeTallerI18n } from "@/lib/talleres"
import { invalidBody, isCalendarDate, readJsonObject } from "@/lib/http"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const taller = await getTallerBySlug(slug)

  if (!taller || (!taller.published && !(await getSession()))) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 })
  }

  return NextResponse.json(taller)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { slug } = await params
  const existing = await getTallerBySlug(slug)

  if (!existing) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 })
  }

  const body = await readJsonObject(request)
  if (!body) return invalidBody()
  if (body.date !== undefined && !isCalendarDate(body.date)) {
    return NextResponse.json({ error: "La fecha debe tener el formato AAAA-MM-DD" }, { status: 400 })
  }
  const text = (key: string, fallback: string) =>
    typeof body[key] === "string" && (body[key] as string).trim() ? (body[key] as string).trim() : fallback

  const sanitizedBlocks = Array.isArray(body.blocks) ? sanitizeContentBlocks(body.blocks) : null

  const updated = {
    ...existing,
    title: text("title", existing.title),
    date: (body.date as string | undefined) ?? existing.date,
    cost: text("cost", existing.cost),
    excerpt: text("excerpt", existing.excerpt),
    coverImage: typeof body.coverImage === "string" ? body.coverImage.trim() || undefined : existing.coverImage,
    blocks: sanitizedBlocks ?? existing.blocks,
    images: Array.isArray(body.images)
      ? body.images
      : sanitizedBlocks
        ? galleryFromBlocks(sanitizedBlocks)
        : existing.images,
    i18n: body.i18n !== undefined ? sanitizeTallerI18n(body.i18n) : existing.i18n,
    published: typeof body.published === "boolean" ? body.published : existing.published,
    updatedAt: new Date().toISOString(),
  }

  await saveTaller(updated)

  revalidatePath("/")
  revalidatePath(`/talleres/${slug}`)

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { slug } = await params
  await deleteTaller(slug)

  revalidatePath("/")
  revalidatePath(`/talleres/${slug}`)

  return NextResponse.json({ ok: true })
}
