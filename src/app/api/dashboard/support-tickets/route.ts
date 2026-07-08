import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const tickets = await db.prepare("SELECT * FROM support_tickets WHERE memberId = ? ORDER BY createdAt DESC").all(member.id) as Record<string, unknown>[]
  return NextResponse.json(tickets)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { subject, message, category, priority } = await request.json()
  if (!subject || !message) return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })

  const result = await db.prepare(
    "INSERT INTO support_tickets (memberId, subject, message, category, priority) VALUES (?, ?, ?, ?, ?)"
  ).run(member.id, subject, message, category || "General", priority || "medium")

  await db.prepare(
    "INSERT INTO notifications (memberId, title, message, type) VALUES (?, ?, ?, ?)"
  ).run(member.id, "Support Ticket Created", `Your ticket "${subject}" has been received. We'll respond within 24 hours.`, "info")

  return NextResponse.json({ success: true, id: result.lastInsertRowid })
}
