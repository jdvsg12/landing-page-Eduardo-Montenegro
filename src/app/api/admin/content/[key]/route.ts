import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { getSiteContent, saveSiteContent } from "@/lib/db-content"
import { isSiteContentKey, parseSiteContent } from "@/lib/site-content"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { key } = await params
  if (!isSiteContentKey(key)) {
    return NextResponse.json({ error: "Sección desconocida" }, { status: 404 })
  }

  return NextResponse.json(await getSiteContent(key))
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { key } = await params
  if (!isSiteContentKey(key)) {
    return NextResponse.json({ error: "Sección desconocida" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = parseSiteContent(key, body)
  if (!parsed.success) {
    return NextResponse.json({ error: `Datos inválidos (${parsed.error})` }, { status: 400 })
  }

  await saveSiteContent(key, parsed.data)

  // El SEO vive en el layout raíz y los datos legales en sus páginas; lo demás en la home.
  revalidatePath("/", "layout")

  return NextResponse.json(parsed.data)
}
