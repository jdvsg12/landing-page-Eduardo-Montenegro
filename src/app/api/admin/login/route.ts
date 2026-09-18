import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { signToken } from "@/lib/auth"
import { readJsonObject } from "@/lib/http"

function matchesAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD
  // Sin contraseña configurada nadie entra: evita que `undefined === undefined` abra el panel.
  if (!expected || typeof password !== "string" || !password) return false
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const body = await readJsonObject(request)

  if (!matchesAdminPassword(body?.password)) {
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
