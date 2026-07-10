import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || ""
  const search = searchParams.get("search") || ""

  let sql = `
    SELECT la.*, m.firstName, m.lastName, m.email as memberEmail, m.phone as memberPhone,
           lp.name as productName
    FROM loan_applications la
    LEFT JOIN members m ON la.memberId = m.id
    LEFT JOIN loan_products lp ON la.productId = lp.id
    WHERE 1=1
  `
  const params: unknown[] = []
  if (status && status !== "all") {
    sql += " AND la.status = ?"; params.push(status)
  }
  if (search) {
    sql += " AND (m.firstName LIKE ? OR m.lastName LIKE ? OR m.email LIKE ?)"
    const q = `%${search}%`; params.push(q, q, q)
  }
  sql += " ORDER BY la.appliedAt DESC"

  const applications = await db.prepare(sql).all(...params)
  return NextResponse.json(applications)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status, notes } = await request.json()
  if (!id || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

  const validStatuses = ["pending", "approved", "rejected", "completed"]
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })

  const app = await db.prepare("SELECT * FROM loan_applications WHERE id = ?").get(id) as Record<string, unknown> | undefined
  if (!app) return NextResponse.json({ error: "Loan application not found" }, { status: 404 })

  await db.prepare(
    "UPDATE loan_applications SET status = ?, reviewedAt = datetime('now'), reviewedBy = ?, notes = COALESCE(?, notes) WHERE id = ?"
  ).run(status, session.id, notes || null, id)

  if (status === "approved") {
    const existingLoan = await db.prepare("SELECT id FROM loans WHERE applicationId = ?").get(id) as Record<string, unknown> | undefined
    if (!existingLoan) {
      await db.prepare(`
        INSERT INTO loans (memberId, applicationId, amount, interestRate, tenure, monthlyPayment, totalInterest, totalRepayment, remainingBalance, status, disbursedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))
      `).run(
        app.memberId, id, app.amount, app.interestRate, app.tenure,
        app.monthlyPayment, app.totalInterest, app.totalRepayment, app.totalRepayment
      )
    }
  }

  await logAudit("update", "loan_application", id, `Status changed to ${status}`)

  return NextResponse.json({ success: true })
}
