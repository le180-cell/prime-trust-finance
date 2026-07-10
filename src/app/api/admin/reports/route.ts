import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    const reports = await db.prepare(
      "SELECT * FROM reports ORDER BY generatedAt DESC LIMIT ? OFFSET ?"
    ).all(limit, offset)
    return NextResponse.json(reports)
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
