import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ias-dev-secret-change-in-production")
const COOKIE_NAME = "ias_token"

export async function signToken(payload: { userId: number; email: string; role: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as { userId: number; email: string; role: string }
  } catch {
    return null
  }
}

export function getAuthCookieName() {
  return COOKIE_NAME
}
