import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const accounts = await db.prepare(`
    SELECT sa.*, m.firstName, m.lastName, m.email as memberEmail, m.phone as memberPhone
    FROM savings_accounts sa
    LEFT JOIN members m ON sa.memberId = m.id
    ORDER BY sa.openedAt DESC
  `).all()

  const enriched = await Promise.all((accounts as Array<Record<string, unknown>>).map(async (acc) => {
    const txs = await db.prepare(`
      SELECT * FROM savings_transactions WHERE accountId = ? ORDER BY createdAt DESC LIMIT 10
    `).all(acc.id)
    return { ...acc, transactions: txs }
  }))

  return NextResponse.json(enriched)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status } = await request.json()
  if (!id || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

  const validStatuses = ["active", "dormant", "closed"]
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })

  const account = await db.prepare("SELECT * FROM savings_accounts WHERE id = ?").get(id) as Record<string, unknown> | undefined
  if (!account) return NextResponse.json({ error: "Savings account not found" }, { status: 404 })

  await db.prepare("UPDATE savings_accounts SET status = ? WHERE id = ?").run(status, id)

  await logAudit("update", "savings_account", id, `Status changed to ${status}`)

  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { memberId, initialDeposit, accountType } = await request.json()
  if (!memberId) return NextResponse.json({ error: "Missing memberId" }, { status: 400 })

  const member = await db.prepare("SELECT id FROM members WHERE id = ?").get(memberId) as Record<string, unknown> | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const amount = Number(initialDeposit) || 0

  let interestRate = 3.0
  if (accountType === "Premium") interestRate = 4.5
  else if (accountType === "Student") interestRate = 2.5

  const result = await db.prepare(`
    INSERT INTO savings_accounts (memberId, balance, interestRate, totalDeposits, status, openedAt)
    VALUES (?, ?, ?, ?, 'active', datetime('now'))
  `).run(memberId, amount, interestRate, amount)

  const accountId = result.lastInsertRowid!

  if (amount > 0) {
    await db.prepare(`
      INSERT INTO savings_transactions (accountId, type, amount, description, balanceBefore, balanceAfter, createdAt)
      VALUES (?, 'deposit', ?, 'Initial deposit', 0, ?, datetime('now'))
    `).run(accountId, amount, amount)
  }

  await logAudit("create", "savings_account", accountId as number, `Created for member ${memberId}`)

  return NextResponse.json({ success: true, id: accountId })
}
