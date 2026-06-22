import { NextResponse } from "next/server"
import { signToken } from "@/lib/auth"

export async function POST(request: Request) {
  const body = await request.json()
  const { password } = body

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
  }

  const token = await signToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return response
}
