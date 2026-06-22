import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)

export async function signToken(payload: Record<string, unknown> = {}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] })
    return true
  } catch {
    return false
  }
}

export async function getSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value
    if (!token) return false
    return verifyToken(token)
  } catch {
    return false
  }
}
