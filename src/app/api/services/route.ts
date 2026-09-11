import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getAllServices, getPublishedServices, getServiceBySlug, saveService } from "@/lib/db-services"
import { invalidBody, readJsonObject } from "@/lib/http"
import { titleToSlug } from "@/lib/talleres"
import { EMPTY_SERVICE_INPUT, serviceFieldsFromBody, type Service } from "@/lib/services"
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

  const body = await readJsonObject(request)
  if (!body) return invalidBody()
  const fields = serviceFieldsFromBody(body, EMPTY_SERVICE_INPUT)

  if (!fields.title?.es?.trim()) {
    return NextResponse.json({ error: "El título en español es obligatorio" }, { status: 400 })
  }

  const slug = titleToSlug(fields.title.es)

  if (!slug) {
    return NextResponse.json({ error: "El título no genera un slug válido" }, { status: 400 })
  }

  // El guardado es un upsert por slug: sin esta verificación un título repetido pisaría otro servicio.
  if (await getServiceBySlug(slug)) {
    return NextResponse.json(
      { error: `Ya existe un servicio con la dirección /servicios/${slug}. Cambia el título.` },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()

  const service: Service = {
    ...fields,
    id: crypto.randomUUID(),
    slug,
    createdAt: now,
    updatedAt: now,
  }

  await saveService(service)

  revalidatePath("/")
  revalidatePath(`/servicios/${slug}`)

  return NextResponse.json(service, { status: 201 })
}
