import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServiceBySlug, saveService, deleteService } from "@/lib/db-services"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
  }

  return NextResponse.json(service)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { slug } = await params
  const existing = await getServiceBySlug(slug)

  if (!existing) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
  }

  const body = await request.json()

  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    kicker: body.kicker ?? existing.kicker,
    excerpt: body.excerpt ?? existing.excerpt,
    coverImage: body.coverImage !== undefined ? body.coverImage : existing.coverImage,
    blocks: body.blocks ?? existing.blocks,
    images: body.images ?? existing.images,
    ctaType: body.ctaType ?? existing.ctaType,
    whatsapp: body.whatsapp !== undefined ? body.whatsapp : existing.whatsapp,
    waMessage: body.waMessage ?? existing.waMessage,
    position: body.position !== undefined ? Number(body.position) : existing.position,
    published: body.published !== undefined ? Boolean(body.published) : existing.published,
    updatedAt: new Date().toISOString(),
  }

  await saveService(updated)

  revalidatePath("/")
  revalidatePath(`/servicios/${slug}`)

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
  await deleteService(slug)

  revalidatePath("/")
  revalidatePath(`/servicios/${slug}`)

  return NextResponse.json({ ok: true })
}
