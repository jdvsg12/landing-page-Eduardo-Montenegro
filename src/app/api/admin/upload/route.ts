import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
  }

  const blob = await put(file.name, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
