import { NextResponse } from "next/server"
import { getTallerBySlug, saveTaller, deleteTaller } from "@/lib/db-talleres"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const taller = await getTallerBySlug(slug)

  if (!taller) {
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

  const body = await request.json()

  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    date: body.date ?? existing.date,
    cost: body.cost ?? existing.cost,
    excerpt: body.excerpt ?? existing.excerpt,
    coverImage: body.coverImage !== undefined ? body.coverImage : existing.coverImage,
    blocks: body.blocks ?? existing.blocks,
    images: body.images ?? existing.images,
    updatedAt: new Date().toISOString(),
  }

  await saveTaller(updated)

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

  return NextResponse.json({ ok: true })
}
