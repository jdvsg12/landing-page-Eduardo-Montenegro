import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServiceBySlug, saveService, deleteService } from "@/lib/db-services"
import { getSession } from "@/lib/auth"
import { serviceFieldsFromBody } from "@/lib/services"
import { invalidBody, readJsonObject } from "@/lib/http"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service || (!service.published && !(await getSession()))) {
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

  const body = await readJsonObject(request)
  if (!body) return invalidBody()

  const updated = {
    ...existing,
    ...serviceFieldsFromBody(body, existing),
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
