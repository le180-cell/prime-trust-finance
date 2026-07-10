import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT * FROM members WHERE email = ?").get(session.email) as Record<string, unknown> | undefined
  if (!member) return NextResponse.json({ balance: 0, walletId: "", currency: "RWF", monthlyIn: 0, monthlyOut: 0, totalDeposits: 0, totalWithdrawn: 0, netPosition: 0, recentTransactions: [] })

  const mid = member.id as number
  const savingsAcct = await db.prepare("SELECT * FROM savings_accounts WHERE memberId = ?").get(mid) as Record<string, unknown> | undefined
  const balance = (savingsAcct?.balance as number) || 0
  const totalDeposits = (savingsAcct?.totalDeposits as number) || 0
  const totalWithdrawn = (savingsAcct?.totalWithdrawn as number) || 0
  const netPosition = totalDeposits - totalWithdrawn
  const memberId = `IAS-${String(member.firstName || "").slice(0, 2).toUpperCase()}${String(member.lastName || "").slice(0, 2).toUpperCase()}-${mid.toString().padStart(4, "0")}`

  const recentTx = await db.prepare("SELECT * FROM savings_transactions WHERE accountId = (SELECT id FROM savings_accounts WHERE memberId = ?) ORDER BY createdAt DESC LIMIT 5").all(mid) as Record<string, unknown>[]

  return NextResponse.json({
    balance,
    walletId: `WAL-${memberId}`,
    currency: "RWF",
    monthlyIn: (savingsAcct?.monthlyContribution as number) || 0,
    monthlyOut: 0,
    totalDeposits,
    totalWithdrawn,
    netPosition,
    recentTransactions: recentTx.map((tx: Record<string, unknown>) => ({
      id: tx.id, type: tx.type, amount: tx.amount, description: tx.description,
      date: tx.createdAt, source: tx.type,
    })),
  })
}
