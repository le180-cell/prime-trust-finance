import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { signToken, verifyToken, getAuthCookieName } from "@/lib/auth-token"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAuthCookieName())?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null

  let user = await db.prepare("SELECT id, email, username, role FROM users WHERE id = ?").get(payload.userId) as
    | { id: number; email: string; username: string | null; role: string }
    | null
  if (!user) {
    user = await db.prepare("SELECT id, email, username, role FROM users WHERE email = ?").get(payload.email) as
      | { id: number; email: string; username: string | null; role: string }
      | null
  }
  if (!user) return null
  return { id: user.id, email: user.email, username: user.username, role: user.role }
}

export { signToken, verifyToken, getAuthCookieName }
