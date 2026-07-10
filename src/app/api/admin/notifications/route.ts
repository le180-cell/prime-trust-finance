import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const unreadMessages = (await db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE read = 0").get() as { count: number }).count

  const newApplications = await db.prepare(`
    SELECT la.id, la.amount, la.appliedAt, m.firstName, m.lastName
    FROM loan_applications la
    LEFT JOIN members m ON la.memberId = m.id
    WHERE la.status = 'pending'
    ORDER BY la.appliedAt DESC
    LIMIT 10
  `).all() as Array<Record<string, unknown>>

  const newMembers = await db.prepare(`
    SELECT u.id, u.email, u.createdAt, m.firstName, m.lastName
    FROM users u
    LEFT JOIN members m ON m.email = u.email
    WHERE u.role = 'user'
    ORDER BY u.createdAt DESC
    LIMIT 10
  `).all() as Array<Record<string, unknown>>

  const recentPayments = await db.prepare(`
    SELECT p.id, p.amount, p.paidAt, p.type, m.firstName, m.lastName
    FROM payments p
    LEFT JOIN members m ON p.memberId = m.id
    WHERE p.status = 'completed'
    ORDER BY p.paidAt DESC
    LIMIT 10
  `).all() as Array<Record<string, unknown>>

  const notifications: Array<Record<string, unknown>> = []

  if (unreadMessages > 0) {
    notifications.push({
      id: "unread-messages",
      title: `${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}`,
      message: "New contact form submissions require your attention.",
      type: "message",
      createdAt: new Date().toISOString(),
      read: false,
    })
  }

  for (const app of newApplications) {
    const name = `${app.firstName || ""} ${app.lastName || ""}`.trim() || "A member"
    notifications.push({
      id: `loan-app-${app.id}`,
      title: "New Loan Application",
      message: `${name} applied for RWF ${Number(app.amount).toLocaleString()}`,
      type: "loan",
      createdAt: app.appliedAt,
      read: false,
    })
  }

  for (const member of newMembers) {
    const name = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email
    notifications.push({
      id: `new-member-${member.id}`,
      title: "New Member Registered",
      message: `${name} joined IAS`,
      type: "member",
      createdAt: member.createdAt,
      read: false,
    })
  }

  for (const p of recentPayments) {
    const name = `${p.firstName || ""} ${p.lastName || ""}`.trim() || "A member"
    notifications.push({
      id: `payment-${p.id}`,
      title: "Payment Received",
      message: `${name} paid RWF ${Number(p.amount).toLocaleString()} (${p.type})`,
      type: "payment",
      createdAt: p.paidAt,
      read: false,
    })
  }

  notifications.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())

  return NextResponse.json({
    count: notifications.length,
    notifications: notifications.slice(0, 20),
  })
}
