import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const accounts = await db.prepare(`
    SELECT la.*, u.email as userEmail, u.role as userRole
    FROM linked_accounts la
    JOIN users u ON u.id = la.userId
    ORDER BY la.createdAt DESC
  `).all() as Array<Record<string, unknown>>

  const enriched = await Promise.all(accounts.map(async (a) => ({
    ...a,
    transactionCount: ((await db.prepare("SELECT COUNT(*) as count FROM transactions WHERE accountId = ?").get(a.id)) as { count: number }).count,
    latestTransaction: await db.prepare("SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC LIMIT 1").get(a.id) as Record<string, unknown> | null,
  })))

  return NextResponse.json({ accounts: enriched })
}
