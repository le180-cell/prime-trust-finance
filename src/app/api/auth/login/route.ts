import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, signToken } from "@/lib/auth"

export async function POST(request: Request) {
  const { username, email, password } = await request.json()
  const identifier = String(username || email || "").trim()

  if (!identifier || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 })
  }

  const user = db.prepare("SELECT id, email, username, passwordHash, role FROM users WHERE email = ? OR username = ?").get(identifier, identifier) as
    | { id: number; email: string; username: string | null; passwordHash: string; role: string }
    | undefined

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const token = await signToken({ userId: user.id, email: user.email, role: user.role })

  const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username, role: user.role } })
  response.cookies.set("ias_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return response
}
