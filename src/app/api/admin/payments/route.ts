import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payments = await db.prepare(`
    SELECT p.*, m.firstName, m.lastName, m.email as memberEmail, m.phone as memberPhone
    FROM payments p
    LEFT JOIN members m ON p.memberId = m.id
    ORDER BY p.paidAt DESC
  `).all()

  return NextResponse.json(payments)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { memberId, type, amount, description, reference, method, status, paidAt } = await request.json()

    if (!memberId || !type || !amount || amount <= 0) {
      return NextResponse.json({ error: "memberId, type, and amount (positive) are required" }, { status: 400 })
    }

    const result = await db.prepare(
      "INSERT INTO payments (memberId, type, amount, description, reference, method, status, paidAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(memberId, type, amount, description || "", reference || null, method || "Cash", status || "completed", paidAt || new Date().toISOString())

    await logAudit("create", "payment", result.lastInsertRowid as number, `${type} - ${amount}`)

    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}
