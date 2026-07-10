import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json([])

  const receivables = await db.prepare("SELECT * FROM receivables WHERE memberId = ? ORDER BY dueDate").all(member.id) as Record<string, unknown>[]
  return NextResponse.json(receivables)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Receivable ID is required" }, { status: 400 })

  const item = await db.prepare("SELECT * FROM receivables WHERE id = ? AND memberId = ?").get(id, member.id) as Record<string, unknown> | undefined
  if (!item) return NextResponse.json({ error: "Receivable not found" }, { status: 404 })

  await db.prepare("UPDATE receivables SET status = 'paid', paidAt = datetime('now') WHERE id = ? AND memberId = ?").run(id, member.id)
  await db.prepare("INSERT INTO payments (memberId, type, amount, description, reference, method, status) VALUES (?, ?, ?, ?, ?, ?, 'completed')").run(member.id, item.type, item.amount, `Payment for ${item.description || item.type}`, item.reference, "mobile")

  return NextResponse.json({ success: true })
}
