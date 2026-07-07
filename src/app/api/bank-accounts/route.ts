import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

function getMode(): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'bank_api_mode'").get() as { value: string } | undefined
  return row?.value || "simulation"
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const accounts = db.prepare(
    "SELECT * FROM linked_accounts WHERE userId = ? ORDER BY createdAt DESC"
  ).all(session.id)

  if (getMode() === "live" && accounts.length > 0) {
    const settings = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[]
    const config: Record<string, string> = {}
    for (const r of settings) config[r.key] = r.value

    // TODO: Replace with real bank API call
    // const res = await fetch(`${config.bank_api_base_url}/accounts/balance`, {
    //   headers: { Authorization: `Bearer ${config.bank_api_client_id}:${config.bank_api_client_secret}` }
    // })
    // const data = await res.json()
    // For now, simulation data is returned
  }

  return NextResponse.json(accounts)
}

function seedMockTransactions(accountId: number) {
  const balance = Math.floor(Math.random() * 50000000) + 500000
  db.prepare("UPDATE linked_accounts SET balance = ? WHERE id = ?").run(balance, accountId)

  const txns = [
    { type: "credit", amount: Math.floor(balance * 0.4), description: "Salary Deposit", ref: "SAL", daysAgo: 3 },
    { type: "debit", amount: Math.floor(Math.random() * 500000) + 50000, description: "ATM Withdrawal", ref: "ATM", daysAgo: 5 },
    { type: "debit", amount: Math.floor(Math.random() * 300000) + 20000, description: "Online Transfer", ref: "OTR", daysAgo: 7 },
    { type: "credit", amount: Math.floor(Math.random() * 200000) + 100000, description: "Mobile Money Deposit", ref: "MOMO", daysAgo: 10 },
    { type: "debit", amount: Math.floor(Math.random() * 100000) + 15000, description: "Utility Payment", ref: "UTL", daysAgo: 12 },
    { type: "credit", amount: Math.floor(Math.random() * 50000) + 10000, description: "Interest Payment", ref: "INT", daysAgo: 14 },
  ]

  const stmt = db.prepare(
    "INSERT INTO transactions (accountId, type, amount, description, reference, date) VALUES (?, ?, ?, ?, ?, ?)"
  )

  for (const tx of txns) {
    const d = new Date()
    d.setDate(d.getDate() - tx.daysAgo)
    stmt.run(accountId, tx.type, tx.amount, tx.description, tx.ref, d.toISOString().split("T")[0])
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { bankName, accountName, accountNumber, accountType } = await request.json()

  if (!bankName || !accountName || !accountNumber) {
    return NextResponse.json({ error: "Bank name, account name, and account number are required." }, { status: 400 })
  }

  const result = db.prepare(
    "INSERT INTO linked_accounts (userId, bankName, accountName, accountNumber, accountType, balance) VALUES (?, ?, ?, ?, ?, 0)"
  ).run(session.id, bankName, accountName, accountNumber, accountType || "checking")

  if (getMode() === "simulation") {
    seedMockTransactions(result.lastInsertRowid as number)
  }

  return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 })
}
