import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""

  let users
  if (search) {
    users = await db.prepare(`
      SELECT u.id, u.email, u.username, u.role, u.createdAt,
             m.firstName, m.lastName, m.phone, m.district, m.occupation, m.memberSince
      FROM users u
      LEFT JOIN members m ON m.email = u.email
      WHERE u.email LIKE ? OR u.username LIKE ? OR m.firstName LIKE ? OR m.lastName LIKE ? OR m.phone LIKE ? OR m.district LIKE ? OR m.occupation LIKE ?
      ORDER BY u.createdAt DESC
    `).all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  } else {
    users = await db.prepare(`
      SELECT u.id, u.email, u.username, u.role, u.createdAt,
             m.firstName, m.lastName, m.phone, m.district, m.occupation, m.memberSince
      FROM users u
      LEFT JOIN members m ON m.email = u.email
      ORDER BY u.createdAt DESC
    `).all()
  }

  const result = await Promise.all((users as Array<Record<string, unknown>>).map(async (u) => ({
    ...u,
    accountCount: ((await db.prepare("SELECT COUNT(*) as count FROM linked_accounts WHERE userId = ?").get(u.id)) as { count: number }).count,
  })))

  return NextResponse.json({ members: result })
}
