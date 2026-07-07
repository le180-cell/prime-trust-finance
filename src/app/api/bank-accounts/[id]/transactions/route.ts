import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

function getMode(): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'bank_api_mode'").get() as { value: string } | undefined
  return row?.value || "simulation"
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { id } = await params

  const account = db.prepare(
    "SELECT id, bankName, accountNumber FROM linked_accounts WHERE id = ? AND userId = ?"
  ).get(Number(id), session.id) as { id: number; bankName: string; accountNumber: string } | undefined

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 })
  }

  if (getMode() === "live") {
    const config = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[]
    const settings: Record<string, string> = {}
    for (const r of config) settings[r.key] = r.value

    // TODO: Replace with real bank API call
    // const res = await fetch(`${settings.bank_api_base_url}/accounts/${account.accountNumber}/transactions`, {
    //   headers: { Authorization: `Bearer ${settings.bank_api_client_id}:${settings.bank_api_client_secret}` }
    // })
    // const data = await res.json()
    // return NextResponse.json(data)
  }

  const transactions = db.prepare(
    "SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC LIMIT 50"
  ).all(Number(id))

  return NextResponse.json(transactions)
}
