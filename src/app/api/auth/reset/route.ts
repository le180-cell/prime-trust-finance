import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  const { token, password } = await request.json() as { token?: string; password?: string }

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const row = await db
    .prepare("SELECT userId, expiresAt FROM reset_tokens WHERE token = ?")
    .get(token) as { userId: number; expiresAt: string } | undefined

  if (!row) {
    return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 })
  }

  if (new Date(row.expiresAt) < new Date()) {
    await db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token)
    return NextResponse.json({ error: "Reset token has expired." }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(passwordHash, row.userId)
  await db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token)
  await db.prepare("DELETE FROM reset_tokens WHERE userId = ?").run(row.userId)

  return NextResponse.json({ success: true })
}
