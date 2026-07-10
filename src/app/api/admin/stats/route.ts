import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const memberCount = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as { count: number }).count
  const adminCount = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number }).count
  const totalUsers = memberCount + adminCount

  const pendingLoans = (await db.prepare("SELECT COUNT(*) as count FROM loan_applications WHERE status = 'pending'").get() as { count: number }).count
  const activeLoans = (await db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'active'").get() as { count: number }).count
  const totalLoansAmount = (await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE status = 'active'").get() as { total: number }).total
  const totalSavings = (await db.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM savings_accounts").get() as { total: number }).total
  const totalReceivables = (await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM receivables WHERE status != 'paid'").get() as { total: number }).total
  const totalPenalties = (await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM penalties WHERE status = 'pending'").get() as { total: number }).total
  const totalPayments = (await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'").get() as { total: number }).total
  const messageCount = (await db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE read = 0").get() as { count: number }).count
  const savingsAccountCount = (await db.prepare("SELECT COUNT(*) as count FROM savings_accounts").get() as { count: number }).count
  const totalDeposits = (await db.prepare("SELECT COALESCE(SUM(totalDeposits), 0) as total FROM savings_accounts").get() as { total: number }).total

  const recentMembers = await db.prepare(`
    SELECT u.id, u.email, u.role, u.createdAt,
           m.firstName, m.lastName, m.phone
    FROM users u
    LEFT JOIN members m ON m.email = u.email
    WHERE u.role = 'user'
    ORDER BY u.createdAt DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  const recentLoanRequests = await db.prepare(`
    SELECT la.*, m.firstName, m.lastName, lp.name as productName
    FROM loan_applications la
    LEFT JOIN members m ON la.memberId = m.id
    LEFT JOIN loan_products lp ON la.productId = lp.id
    ORDER BY la.appliedAt DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  const recentPayments = await db.prepare(`
    SELECT p.*, m.firstName, m.lastName
    FROM payments p
    LEFT JOIN members m ON p.memberId = m.id
    ORDER BY p.paidAt DESC
    LIMIT 5
  `).all() as Array<Record<string, unknown>>

  const recentActivity = await db.prepare(`
    SELECT a.*, m.firstName, m.lastName
    FROM audit_logs a
    LEFT JOIN users u ON a.adminId = u.id
    LEFT JOIN members m ON m.email = u.email
    ORDER BY a.createdAt DESC
    LIMIT 6
  `).all() as Array<Record<string, unknown>>

  const savingsGrowth = await db.prepare(`
    SELECT strftime('%m', createdAt) as month, COALESCE(SUM(amount), 0) as value
    FROM savings_transactions WHERE type = 'deposit' AND createdAt >= date('now', '-12 months')
    GROUP BY strftime('%m', createdAt) ORDER BY month
  `).all() as Array<Record<string, unknown>>

  const monthlyData = await db.prepare(`
    SELECT
      strftime('%m', p.paidAt) as month,
      COALESCE(SUM(CASE WHEN p.type = 'deposit' THEN p.amount ELSE 0 END), 0) as savings,
      COALESCE(SUM(CASE WHEN p.type = 'loan_payment' THEN p.amount ELSE 0 END), 0) as loans,
      COALESCE(SUM(p.amount), 0) as income
    FROM payments p
    WHERE p.status = 'completed' AND p.paidAt >= date('now', '-12 months')
    GROUP BY strftime('%m', p.paidAt) ORDER BY month
  `).all() as Array<Record<string, unknown>>

  return NextResponse.json({
    stats: {
      totalUsers,
      memberCount,
      adminCount,
      pendingLoans,
      activeLoans,
      totalLoansAmount,
      totalSavings,
      totalReceivables,
      totalPenalties,
      totalPayments,
      savingsAccountCount,
      totalDeposits,
      unreadMessages: messageCount,
    },
    recentMembers,
    recentLoanRequests,
    recentPayments,
    recentActivity,
    savingsGrowth,
    monthlyData,
  })
}
