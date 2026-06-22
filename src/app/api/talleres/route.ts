import { NextResponse } from "next/server"
import { getAllTalleres, saveTaller } from "@/lib/db-talleres"
import { titleToSlug } from "@/lib/talleres"
import type { Taller } from "@/lib/talleres"
import { getSession } from "@/lib/auth"

export async function GET() {
  const talleres = await getAllTalleres()
  return NextResponse.json(talleres)
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { title, date, cost, excerpt, coverImage, blocks, images } = body

  if (!title || !date || !cost || !excerpt) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const slug = titleToSlug(title)

  const taller: Taller = {
    id: crypto.randomUUID(),
    slug,
    title,
    date,
    cost,
    excerpt,
    coverImage: coverImage || undefined,
    blocks: blocks || [],
    images: images || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveTaller(taller)

  return NextResponse.json(taller, { status: 201 })
}
