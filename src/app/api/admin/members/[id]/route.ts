import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const user = await db.prepare(`
    SELECT u.id, u.email, u.username, u.role, u.createdAt,
           m.firstName, m.lastName, m.username as memberUsername, m.gender, m.dateOfBirth, m.nationalId, m.phone,
           m.district, m.sector, m.cell, m.village, m.occupation, m.employer, m.monthlyIncome,
           m.maritalStatus, m.securityQuestion, m.profilePhoto, m.nationalIdDocument, m.memberSince
    FROM users u
    LEFT JOIN members m ON m.email = u.email
    WHERE u.id = ?
  `).get(userId) as Record<string, unknown> | undefined

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const accounts = await db.prepare(`
    SELECT * FROM linked_accounts WHERE userId = ?
  `).all(userId) as Array<Record<string, unknown>>

  const enrichedAccounts = await Promise.all(accounts.map(async (a) => ({
    ...a,
    transactions: await db.prepare("SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC LIMIT 10").all(a.id),
  })))

  return NextResponse.json({ member: user, accounts: enrichedAccounts })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const body = await request.json()
  const { role, firstName, lastName, phone, district, sector, cell, village, occupation, employer, monthlyIncome, maritalStatus } = body

  if (role && !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  if (role) {
    await db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId)
  }

  if (firstName || lastName || phone || district || sector || cell || village || occupation || employer || monthlyIncome || maritalStatus) {
    const user = await db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined
    if (user) {
      const existing = await db.prepare("SELECT id FROM members WHERE email = ?").get(user.email) as { id: number } | undefined
      if (existing) {
        const updates: string[] = []
        const values: unknown[] = []
        if (firstName) { updates.push("firstName = ?"); values.push(firstName) }
        if (lastName) { updates.push("lastName = ?"); values.push(lastName) }
        if (phone) { updates.push("phone = ?"); values.push(phone) }
        if (district) { updates.push("district = ?"); values.push(district) }
        if (sector) { updates.push("sector = ?"); values.push(sector) }
        if (cell) { updates.push("cell = ?"); values.push(cell) }
        if (village) { updates.push("village = ?"); values.push(village) }
        if (occupation) { updates.push("occupation = ?"); values.push(occupation) }
        if (employer) { updates.push("employer = ?"); values.push(employer) }
        if (monthlyIncome) { updates.push("monthlyIncome = ?"); values.push(monthlyIncome) }
        if (maritalStatus) { updates.push("maritalStatus = ?"); values.push(maritalStatus) }
        if (updates.length > 0) {
          values.push(user.email)
          await db.prepare(`UPDATE members SET ${updates.join(", ")} WHERE email = ?`).run(...values)
        }
      } else if (firstName && lastName) {
        await db.prepare("INSERT INTO members (firstName, lastName, email, phone, district, sector, cell, village, occupation, employer, monthlyIncome, maritalStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
          firstName,
          lastName,
          user.email,
          phone || null,
          district || null,
          sector || null,
          cell || null,
          village || null,
          occupation || null,
          employer || null,
          monthlyIncome || null,
          maritalStatus || null,
        )
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const user = await db.prepare("SELECT id FROM users WHERE id = ?").get(userId) as { id: number } | undefined
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const accounts = await db.prepare("SELECT id FROM linked_accounts WHERE userId = ?").all(userId) as Array<{ id: number }>
  for (const a of accounts) {
    await db.prepare("DELETE FROM transactions WHERE accountId = ?").run(a.id)
  }
  await db.prepare("DELETE FROM linked_accounts WHERE userId = ?").run(userId)
  await db.prepare("DELETE FROM members WHERE email = (SELECT email FROM users WHERE id = ?)").run(userId)
  await db.prepare("DELETE FROM users WHERE id = ?").run(userId)

  return NextResponse.json({ success: true })
}
