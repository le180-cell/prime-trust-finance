import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json([])

  const events = await db.prepare("SELECT * FROM calendar_events WHERE memberId = ? ORDER BY date, time").all(member.id) as Record<string, unknown>[]
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { title, date, time, type, amount, description } = await request.json()
  const result = await db.prepare(
    "INSERT INTO calendar_events (memberId, title, date, time, type, amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(member.id, title, date, time || null, type || "reminder", amount || null, description || null)

  return NextResponse.json({ success: true, id: result.lastInsertRowid })
}
