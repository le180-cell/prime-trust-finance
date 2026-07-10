import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""

  let users
  if (search) {
    users = await db.prepare(`
      SELECT u.id, u.email, u.username, u.role, u.createdAt,
             m.firstName, m.lastName, m.phone, m.district, m.occupation, m.memberSince
      FROM users u
      LEFT JOIN members m ON m.email = u.email
      WHERE u.email LIKE ? OR u.username LIKE ? OR m.firstName LIKE ? OR m.lastName LIKE ? OR m.phone LIKE ? OR m.district LIKE ? OR m.occupation LIKE ?
      ORDER BY u.createdAt DESC
    `).all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  } else {
    users = await db.prepare(`
      SELECT u.id, u.email, u.username, u.role, u.createdAt,
             m.firstName, m.lastName, m.phone, m.district, m.occupation, m.memberSince
      FROM users u
      LEFT JOIN members m ON m.email = u.email
      ORDER BY u.createdAt DESC
    `).all()
  }

  const result = await Promise.all((users as Array<Record<string, unknown>>).map(async (u) => ({
    ...u,
    accountCount: ((await db.prepare("SELECT COUNT(*) as count FROM linked_accounts WHERE userId = ?").get(u.id)) as { count: number }).count,
  })))

  return NextResponse.json({ members: result })
}

export async function POST(request: NextRequest) {
  const { firstName, lastName, email, password, phone, district, occupation } = await request.json()
  if (!firstName || !email || !password) return NextResponse.json({ error: "firstName, email, and password are required" }, { status: 400 })

  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

  const hash = bcrypt.hashSync(password, 10)
  const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")

  const userResult = await db.prepare(
    "INSERT INTO users (email, username, passwordHash, role, createdAt) VALUES (?, ?, ?, 'user', datetime('now'))"
  ).run(email, username, hash)

  const memberResult = await db.prepare(
    "INSERT INTO members (firstName, lastName, email, phone, district, occupation, memberSince) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
  ).run(firstName, lastName || "", email, phone || "", district || "", occupation || "")

  const m = await db.prepare("SELECT id FROM members WHERE email = ?").get(email) as { id: number } | undefined
  if (m) {
    await db.prepare("INSERT INTO savings_accounts (memberId, balance, interestRate, monthlyContribution, totalDeposits, totalWithdrawn, interestEarned) VALUES (?, 0, 4.5, 0, 0, 0, 0)").run(m.id)
    await db.prepare("INSERT INTO notifications (memberId, title, message, type) VALUES (?, ?, ?, 'success')").run(m.id, "Welcome to IAS!", `Your account has been created by the admin team. Login with your email and password to get started.`)
    await db.prepare("INSERT INTO member_activities (memberId, action, description, category) VALUES (?, ?, ?, 'auth')").run(m.id, "Account Created", "Member registered by admin.")
  }

  return NextResponse.json({ success: true })
}
