import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const staff = await db.prepare(`
    SELECT u.id, u.email, u.username, u.role, u.createdAt, u.active,
           m.firstName, m.lastName, m.phone, m.district
    FROM users u
    LEFT JOIN members m ON m.email = u.email
    WHERE u.role IN ('admin', 'manager', 'officer', 'viewer')
    ORDER BY u.createdAt DESC
  `).all()

  return NextResponse.json(staff)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email, name, password, role, department } = await request.json()
  if (!email || !password || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 })

  const hash = bcrypt.hashSync(password, 10)
  const username = email.split("@")[0].toLowerCase()
  await db.prepare("INSERT INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)").run(email, username, hash, role || "officer")
  await db.prepare("INSERT INTO members (firstName, lastName, email, phone, district) VALUES (?, ?, ?, ?, ?)").run(name, "", email, "", department || "")

  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, email, name, role, department, password, active } = await request.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await db.prepare("UPDATE users SET email = ?, role = ? WHERE id = ?").run(email, role || "officer", id)
  await db.prepare("UPDATE members SET firstName = ?, district = ? WHERE email = ?").run(name, department || "", email)
  if (password) {
    const hash = bcrypt.hashSync(password, 10)
    await db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(hash, id)
  }
  if (active !== undefined) {
    await db.prepare("UPDATE users SET active = ? WHERE id = ?").run(active ? 1 : 0, id)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const user = await db.prepare("SELECT email FROM users WHERE id = ?").get(id) as { email: string } | undefined
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.prepare("DELETE FROM members WHERE email = ?").run(user.email)
  await db.prepare("DELETE FROM users WHERE id = ?").run(id)

  return NextResponse.json({ success: true })
}
