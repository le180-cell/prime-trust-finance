import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const { amount, sourceType, sourceId, destinationType, destinationId, reference } = await request.json()

  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  if (!destinationType || !destinationId) return NextResponse.json({ error: "Destination is required" }, { status: 400 })
  if (!sourceType) return NextResponse.json({ error: "Payment source is required" }, { status: 400 })

  const validDestinations = ["loan", "receivable"]
  if (!validDestinations.includes(destinationType)) return NextResponse.json({ error: "Invalid destination" }, { status: 400 })

  const validSources = ["bank_account", "mobile_money", "bank_transfer", "cash"]
  if (!validSources.includes(sourceType)) return NextResponse.json({ error: "Invalid payment source" }, { status: 400 })

  const mode = ((await db.prepare("SELECT value FROM settings WHERE key = 'bank_api_mode'").get()) as { value: string } | undefined)?.value || "simulation"

  // Validate and process based on destination type
  if (destinationType === "loan") {
    const repayment = await db.prepare(
      "SELECT r.*, l.memberId, l.id as loanId FROM loan_repayments r JOIN loans l ON l.id = r.loanId WHERE r.id = ?"
    ).get(destinationId) as Record<string, unknown> | undefined

    if (!repayment) return NextResponse.json({ error: "Repayment not found" }, { status: 404 })
    if (repayment.memberId !== member.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    if (repayment.paid) return NextResponse.json({ error: "Already paid" }, { status: 400 })

    // Process bank account payment
    if (sourceType === "bank_account") {
      if (!sourceId) return NextResponse.json({ error: "Bank account is required" }, { status: 400 })
      const bankAcct = await db.prepare("SELECT * FROM linked_accounts WHERE id = ? AND userId = ?").get(sourceId, session.id) as Record<string, unknown> | undefined
      if (!bankAcct) return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
      if ((bankAcct.balance as number) < amount) return NextResponse.json({ error: "Insufficient balance in bank account" }, { status: 400 })

      if (mode === "simulation") {
        await db.prepare("UPDATE linked_accounts SET balance = balance - ? WHERE id = ?").run(amount, sourceId)
      }
    }

    const loanId = repayment.loanId as number
    await db.prepare("UPDATE loan_repayments SET paid = 1, paidDate = datetime('now') WHERE id = ?").run(destinationId)
    await db.prepare("UPDATE loans SET paidMonths = paidMonths + 1, remainingBalance = remainingBalance - ? WHERE id = ?").run(amount, loanId)

    const paidMonths = (await db.prepare("SELECT COUNT(*) as c FROM loan_repayments WHERE loanId = ? AND paid = 1").get(loanId) as { c: number }).c
    const totalMonths = (await db.prepare("SELECT COUNT(*) as c FROM loan_repayments WHERE loanId = ?").get(loanId) as { c: number }).c
    if (paidMonths >= totalMonths) {
      await db.prepare("UPDATE loans SET status = 'completed', completedAt = datetime('now') WHERE id = ?").run(loanId)
    }

    await db.prepare(
      "INSERT INTO payments (memberId, type, amount, description, reference, method, status, paidAt) VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'))"
    ).run(member.id, "loan_payment", amount, `Loan repayment`, reference || `LOAN-${loanId}`, sourceType)

    await db.prepare(
      "INSERT INTO member_activities (memberId, action, description, category) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Loan Payment", `Loan repayment of RWF ${amount.toLocaleString()} completed.`, "payment")

    await db.prepare(
      "INSERT INTO notifications (memberId, title, message, type) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Payment Received", `Your loan payment of RWF ${amount.toLocaleString()} has been received.`, "success")

    return NextResponse.json({ success: true, type: "loan", remainingBalance: (await db.prepare("SELECT remainingBalance FROM loans WHERE id = ?").get(loanId) as Record<string, unknown>).remainingBalance })
  }

  if (destinationType === "receivable") {
    const receivable = await db.prepare("SELECT * FROM receivables WHERE id = ? AND memberId = ?").get(destinationId, member.id) as Record<string, unknown> | undefined
    if (!receivable) return NextResponse.json({ error: "Receivable not found" }, { status: 404 })
    if (receivable.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 })

    if (sourceType === "bank_account") {
      if (!sourceId) return NextResponse.json({ error: "Bank account is required" }, { status: 400 })
      const bankAcct = await db.prepare("SELECT * FROM linked_accounts WHERE id = ? AND userId = ?").get(sourceId, session.id) as Record<string, unknown> | undefined
      if (!bankAcct) return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
      if ((bankAcct.balance as number) < amount) return NextResponse.json({ error: "Insufficient balance in bank account" }, { status: 400 })

      if (mode === "simulation") {
        await db.prepare("UPDATE linked_accounts SET balance = balance - ? WHERE id = ?").run(amount, sourceId)
      }
    }

    await db.prepare("UPDATE receivables SET status = 'paid', paidAt = datetime('now') WHERE id = ?").run(destinationId)

    await db.prepare(
      "INSERT INTO payments (memberId, type, amount, description, reference, method, status, paidAt) VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'))"
    ).run(member.id, receivable.type as string, amount, `Payment for ${receivable.description || receivable.type}`, reference || `REC-${destinationId}`, sourceType)

    await db.prepare(
      "INSERT INTO member_activities (memberId, action, description, category) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Payment", `${receivable.type} payment of RWF ${amount.toLocaleString()} completed.`, "payment")

    await db.prepare(
      "INSERT INTO notifications (memberId, title, message, type) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Payment Received", `Your ${receivable.type} payment of RWF ${amount.toLocaleString()} has been received.`, "success")

    return NextResponse.json({ success: true, type: "receivable" })
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
}
