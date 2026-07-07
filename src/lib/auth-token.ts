import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "ias-dev-secret-change-in-production"
const COOKIE_NAME = "ias_token"

export function signToken(payload: { userId: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string }
  } catch {
    return null
  }
}

export function getAuthCookieName() {
  return COOKIE_NAME
}
