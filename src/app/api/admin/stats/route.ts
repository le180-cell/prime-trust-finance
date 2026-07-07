import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const memberCount = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as { count: number }).count
  const adminCount = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number }).count
  const totalUsers = memberCount + adminCount

  const accountCount = (await db.prepare("SELECT COUNT(*) as count FROM linked_accounts").get() as { count: number }).count
  const txCount = (await db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number }).count
  const totalSavings = (await db.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM linked_accounts").get() as { total: number }).total
  const messageCount = (await db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE read = 0").get() as { count: number }).count

  const recentMembers = await db.prepare(`
    SELECT u.id, u.email, u.role, u.createdAt,
           m.firstName, m.lastName, m.phone
    FROM users u
    LEFT JOIN members m ON m.email = u.email
    ORDER BY u.createdAt DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  const recentTransactions = await db.prepare(`
    SELECT t.id, t.type, t.amount, t.description, t.status, t.date,
           la.accountName, la.accountNumber, la.bankName,
           u.email as userEmail
    FROM transactions t
    JOIN linked_accounts la ON la.id = t.accountId
    JOIN users u ON u.id = la.userId
    ORDER BY t.date DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  const recentMessages = await db.prepare(`
    SELECT id, name, email, subject, message, read, createdAt
    FROM contact_messages
    ORDER BY createdAt DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  return NextResponse.json({
    stats: {
      totalUsers,
      memberCount,
      adminCount,
      totalAccounts: accountCount,
      totalTransactions: txCount,
      totalSavings,
      unreadMessages: messageCount,
    },
    recentMembers,
    recentTransactions,
    recentMessages,
  })
}
