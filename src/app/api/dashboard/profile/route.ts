import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db
    .prepare("SELECT * FROM members WHERE email = ?")
    .get(session.email) as Record<string, unknown> | undefined

  const firstName = (member?.firstName as string) || session.username || "Member"
  const lastName = (member?.lastName as string) || ""

  return NextResponse.json({
    profile: {
      id: session.id,
      email: session.email,
      username: session.username,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      phone: (member?.phone as string) || "",
      dateOfBirth: (member?.dateOfBirth as string) || "",
      gender: (member?.gender as string) || "",
      nationalId: (member?.nationalId as string) || "",
      district: (member?.district as string) || "",
      sector: (member?.sector as string) || "",
      cell: (member?.cell as string) || "",
      village: (member?.village as string) || "",
      occupation: (member?.occupation as string) || "",
      employer: (member?.employer as string) || "",
      monthlyIncome: (member?.monthlyIncome as string) || "",
      maritalStatus: (member?.maritalStatus as string) || "",
      profilePhoto: (member?.profilePhoto as string) || null,
      memberSince: (member?.memberSince as string) || "",
    },
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { firstName, lastName, phone, district, sector, cell, village, occupation, employer, monthlyIncome, maritalStatus } = body

  const existing = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined

  if (existing) {
    const updates: string[] = []
    const values: unknown[] = []
    if (firstName !== undefined) { updates.push("firstName = ?"); values.push(firstName) }
    if (lastName !== undefined) { updates.push("lastName = ?"); values.push(lastName) }
    if (phone !== undefined) { updates.push("phone = ?"); values.push(phone) }
    if (district !== undefined) { updates.push("district = ?"); values.push(district) }
    if (sector !== undefined) { updates.push("sector = ?"); values.push(sector) }
    if (cell !== undefined) { updates.push("cell = ?"); values.push(cell) }
    if (village !== undefined) { updates.push("village = ?"); values.push(village) }
    if (occupation !== undefined) { updates.push("occupation = ?"); values.push(occupation) }
    if (employer !== undefined) { updates.push("employer = ?"); values.push(employer) }
    if (monthlyIncome !== undefined) { updates.push("monthlyIncome = ?"); values.push(monthlyIncome) }
    if (maritalStatus !== undefined) { updates.push("maritalStatus = ?"); values.push(maritalStatus) }
    if (updates.length > 0) {
      values.push(session.email)
      await db.prepare(`UPDATE members SET ${updates.join(", ")} WHERE email = ?`).run(...values)
    }
  } else if (firstName && lastName) {
    await db.prepare(
      "INSERT INTO members (firstName, lastName, email, phone, district, sector, cell, village, occupation, employer, monthlyIncome, maritalStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(firstName, lastName, session.email, phone || null, district || null, sector || null, cell || null, village || null, occupation || null, employer || null, monthlyIncome || null, maritalStatus || null)
  }

  return NextResponse.json({ success: true })
}
