import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const member = await db.prepare(
    "SELECT firstName, lastName, phone, district, sector FROM members WHERE email = ?"
  ).get(session.email) as { firstName: string; lastName: string; phone: string | null; district: string | null; sector: string | null } | undefined

  return NextResponse.json({
    id: session.id,
    email: session.email,
    username: session.username,
    role: session.role,
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    phone: member?.phone || "",
    district: member?.district || "",
    sector: member?.sector || "",
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await request.json()

  if (body.currentPassword && body.newPassword) {
    const user = await db.prepare("SELECT id, passwordHash FROM users WHERE id = ?").get(session.id) as { id: number; passwordHash: string } | undefined
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = bcrypt.compareSync(body.currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

    const hash = bcrypt.hashSync(body.newPassword, 10)
    await db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(hash, session.id)
    return NextResponse.json({ success: true, message: "Password changed" })
  }

  const { name, phone, language, timezone } = body
  if (name) {
    const parts = name.trim().split(/\s+/)
    const firstName = parts[0] || ""
    const lastName = parts.slice(1).join(" ") || ""
    await db.prepare("UPDATE members SET firstName = ?, lastName = ? WHERE email = ?").run(firstName, lastName, session.email)
  }
  if (phone) {
    await db.prepare("UPDATE members SET phone = ? WHERE email = ?").run(phone, session.email)
  }

  return NextResponse.json({ success: true, message: "Profile updated" })
}
