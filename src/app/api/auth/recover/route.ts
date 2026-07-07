import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  const { identifier } = (await request.json()) as { identifier?: string }
  const value = String(identifier || "").trim()

  if (!value) {
    return NextResponse.json({ error: "Email or username is required." }, { status: 400 })
  }

  const user = db
    .prepare("SELECT id, email FROM users WHERE email = ? OR username = ?")
    .get(value, value) as { id: number; email: string } | undefined

  if (user) {
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    db.prepare("INSERT INTO reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)").run(
      user.id,
      token,
      expiresAt,
    )

    const origin = new URL(request.url).origin
    const resetLink = `${origin}/reset-password?token=${token}`

    const sent = await sendPasswordResetEmail(user.email, resetLink)
    if (!sent && process.env.NODE_ENV === "development") {
      console.log(`[DEV] Password reset link for ${user.email}: ${resetLink}`)
    }
  }

  return NextResponse.json({ success: true })
}
