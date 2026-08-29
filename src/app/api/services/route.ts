import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getAllServices, getPublishedServices, saveService } from "@/lib/db-services"
import { titleToSlug } from "@/lib/talleres"
import type { Service } from "@/lib/services"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  const isAdmin = await getSession()
  const includeDrafts = new URL(request.url).searchParams.get("all") === "1"

  const services = isAdmin && includeDrafts
    ? await getAllServices()
    : await getPublishedServices()

  return NextResponse.json(services)
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { title, kicker, excerpt, coverImage, blocks, images, ctaType, whatsapp, waMessage, position, published } = body

  if (!title?.es?.trim()) {
    return NextResponse.json({ error: "El título en español es obligatorio" }, { status: 400 })
  }

  const slug = titleToSlug(title.es)

  if (!slug) {
    return NextResponse.json({ error: "El título no genera un slug válido" }, { status: 400 })
  }

  const now = new Date().toISOString()

  const service: Service = {
    id: crypto.randomUUID(),
    slug,
    title,
    kicker: kicker ?? {},
    excerpt: excerpt ?? {},
    coverImage: coverImage || undefined,
    blocks: blocks ?? [],
    images: images ?? [],
    ctaType: ctaType === "form" ? "form" : "whatsapp",
    whatsapp: whatsapp || undefined,
    waMessage: waMessage ?? {},
    position: Number.isFinite(Number(position)) ? Number(position) : 0,
    published: published !== false,
    createdAt: now,
    updatedAt: now,
  }

  await saveService(service)

  revalidatePath("/")
  revalidatePath(`/servicios/${slug}`)

  return NextResponse.json(service, { status: 201 })
}
