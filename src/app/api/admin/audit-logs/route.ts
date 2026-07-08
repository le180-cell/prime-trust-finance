import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    const logs = await db.prepare(
      "SELECT a.*, u.username as adminName FROM audit_logs a LEFT JOIN users u ON a.adminId = u.id ORDER BY a.createdAt DESC LIMIT ? OFFSET ?"
    ).all(limit, offset)
    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
