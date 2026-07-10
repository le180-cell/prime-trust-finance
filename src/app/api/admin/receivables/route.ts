import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const receivables = await db.prepare(`
    SELECT r.*, m.firstName, m.lastName, m.email as memberEmail, m.phone as memberPhone
    FROM receivables r
    LEFT JOIN members m ON r.memberId = m.id
    ORDER BY r.createdAt DESC
  `).all()

  return NextResponse.json(receivables)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    await db.prepare(
      "UPDATE receivables SET status = 'paid', paidAt = ? WHERE id = ?"
    ).run(new Date().toISOString(), id)

    await logAudit("update", "receivable", id, "Marked as paid")

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update receivable" }, { status: 500 })
  }
}
