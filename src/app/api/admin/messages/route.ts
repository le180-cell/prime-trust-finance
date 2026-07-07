import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const messages = await db.prepare(`
    SELECT * FROM contact_messages ORDER BY createdAt DESC
  `).all()

  return NextResponse.json({ messages })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, read } = body

  if (!id) return NextResponse.json({ error: "Message ID required" }, { status: 400 })

  await db.prepare("UPDATE contact_messages SET read = ? WHERE id = ?").run(read ? 1 : 0, id)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Message ID required" }, { status: 400 })

  await db.prepare("DELETE FROM contact_messages WHERE id = ?").run(parseInt(id, 10))

  return NextResponse.json({ success: true })
}
