import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const notifications = await db.prepare("SELECT * FROM notifications WHERE memberId = ? ORDER BY createdAt DESC").all(member.id) as Record<string, unknown>[]
  return NextResponse.json(notifications)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { id, read } = await request.json()
  if (id === "all") {
    await db.prepare("UPDATE notifications SET read = 1 WHERE memberId = ?").run(member.id)
  } else {
    await db.prepare("UPDATE notifications SET read = ? WHERE id = ? AND memberId = ?").run(read ? 1 : 0, id, member.id)
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (id) {
    await db.prepare("DELETE FROM notifications WHERE id = ? AND memberId = ?").run(Number(id), member.id)
  } else {
    await db.prepare("DELETE FROM notifications WHERE memberId = ?").run(member.id)
  }
  return NextResponse.json({ success: true })
}
