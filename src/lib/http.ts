import { NextResponse } from "next/server"

/** Lee el cuerpo como objeto JSON. Devuelve `null` si no es JSON válido o no es un objeto. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function invalidBody() {
  return NextResponse.json({ error: "El cuerpo de la petición no es un JSON válido" }, { status: 400 })
}

/** Fecha de calendario real en formato YYYY-MM-DD (rechaza 2026-02-30). */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
