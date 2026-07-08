import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(session.email) as { id: number } | undefined
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  const payments = await db.prepare("SELECT * FROM payments WHERE memberId = ? ORDER BY paidAt DESC").all(member.id) as Record<string, unknown>[]
  const now = new Date()
  const currentYear = now.getFullYear()

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const statements: Record<string, unknown>[] = []

  for (let m = 0; m < 12; m++) {
    const monthPayments = payments.filter((p: Record<string, unknown>) => {
      const d = new Date(p.paidAt as string)
      return d.getMonth() === m && d.getFullYear() === currentYear
    })
    const credits = monthPayments.filter((p: Record<string, unknown>) => p.type === "deposit" || p.type === "credit").reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number), 0)
    const debits = monthPayments.filter((p: Record<string, unknown>) => p.type === "debit" || p.type === "withdrawal" || p.type === "loan_payment").reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number), 0)
    if (credits > 0 || debits > 0) {
      statements.push({
        id: statements.length + 1, period: `${monthNames[m]} ${currentYear}`, month: m + 1, year: currentYear,
        type: "Monthly", totalCredits: credits, totalDebits: debits,
        openingBalance: 0, closingBalance: credits - debits,
        generatedDate: now.toISOString().split("T")[0], downloaded: false,
      })
    }
  }

  const totalCredits = payments.filter((p: Record<string, unknown>) => p.type === "deposit" || p.type === "credit").reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number), 0)
  const totalDebits = payments.filter((p: Record<string, unknown>) => p.type === "debit" || p.type === "withdrawal" || p.type === "loan_payment").reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number), 0)
  statements.push({
    id: statements.length + 1, period: `${currentYear} Annual`, month: 0, year: currentYear,
    type: "Annual", totalCredits, totalDebits,
    openingBalance: 0, closingBalance: totalCredits - totalDebits,
    generatedDate: now.toISOString().split("T")[0], downloaded: false,
  })

  return NextResponse.json(statements)
}
