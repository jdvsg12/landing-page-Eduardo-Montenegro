import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getAllTalleres, getPublishedTalleres, getTallerBySlug, saveTaller } from "@/lib/db-talleres"
import { titleToSlug, sanitizeTallerI18n, type Taller } from "@/lib/talleres"
import { galleryFromBlocks, sanitizeContentBlocks } from "@/lib/content-blocks"
import { getSession } from "@/lib/auth"
import { invalidBody, isCalendarDate, readJsonObject } from "@/lib/http"

export async function GET(request: Request) {
  const isAdmin = await getSession()
  const includePrivate = new URL(request.url).searchParams.get("all") === "1"

  const talleres = isAdmin && includePrivate ? await getAllTalleres() : await getPublishedTalleres()
  return NextResponse.json(talleres)
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await readJsonObject(request)
  if (!body) return invalidBody()
  const { title, date, cost, excerpt, coverImage, blocks, images, published, i18n } = body

  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")
  if (!text(title) || !text(cost) || !text(excerpt) || !date) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }
  if (!isCalendarDate(date)) {
    return NextResponse.json({ error: "La fecha debe tener el formato AAAA-MM-DD" }, { status: 400 })
  }

  const slug = titleToSlug(text(title))
  if (!slug) {
    return NextResponse.json({ error: "El título no genera un slug válido" }, { status: 400 })
  }
  if (await getTallerBySlug(slug)) {
    return NextResponse.json(
      { error: `Ya existe un taller con la dirección /talleres/${slug}. Cambia el título.` },
      { status: 409 }
    )
  }

  const taller: Taller = {
    id: crypto.randomUUID(),
    slug,
    title: text(title),
    date,
    cost: text(cost),
    excerpt: text(excerpt),
    coverImage: text(coverImage) || undefined,
    blocks: sanitizeContentBlocks(blocks) ?? [],
    images: Array.isArray(images) ? images : galleryFromBlocks(sanitizeContentBlocks(blocks) ?? []),
    i18n: sanitizeTallerI18n(i18n),
    published: typeof published === "boolean" ? published : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveTaller(taller)

  revalidatePath("/")
  revalidatePath(`/talleres/${slug}`)

  return NextResponse.json(taller, { status: 201 })
}
