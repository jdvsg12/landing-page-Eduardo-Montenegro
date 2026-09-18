import { describe, expect, it, vi } from "vitest"
import { SignJWT } from "jose"

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }))

const { signToken, verifyToken, getSession } = await import("@/lib/auth")
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)

describe("sesión del administrador", () => {
  it("acepta un token recién firmado", async () => {
    expect(await verifyToken(await signToken())).toBe(true)
  })

  it("rechaza un token alterado", async () => {
    const token = await signToken()
    const [header, payload, signature] = token.split(".")
    const forgedPayload = Buffer.from(JSON.stringify({ admin: true, exp: 9999999999 })).toString("base64url")
    expect(await verifyToken(`${header}.${forgedPayload}.${signature}`)).toBe(false)
    expect(await verifyToken(`${header}.${payload}.${signature.slice(0, -2)}xx`)).toBe(false)
  })

  it("rechaza un token firmado con otro secreto", async () => {
    const other = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("otro-secreto-cualquiera"))
    expect(await verifyToken(other)).toBe(false)
  })

  it("rechaza un token vencido", async () => {
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret)
    expect(await verifyToken(expired)).toBe(false)
  })

  it("rechaza un token sin firma (alg: none)", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")
    const payload = Buffer.from(JSON.stringify({ exp: 9999999999 })).toString("base64url")
    expect(await verifyToken(`${header}.${payload}.`)).toBe(false)
  })

  it.each(["", "basura", "a.b.c", "null"])("rechaza %j", async (token) => {
    expect(await verifyToken(token)).toBe(false)
  })

  it("sin cookie no hay sesión", async () => {
    expect(await getSession()).toBe(false)
  })
})
