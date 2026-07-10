import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json([])

  const activities = await db.prepare("SELECT * FROM member_activities WHERE memberId = ? ORDER BY createdAt DESC LIMIT 50").all(member.id) as Record<string, unknown>[]
  return NextResponse.json(activities)
}
