import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type, format, fromDate, toDate } = await request.json()
  if (!type) return NextResponse.json({ error: "Missing report type" }, { status: 400 })

  const fmt = format || "pdf"
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const name = `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${dateStr}`
  const filename = `${type}-${dateStr}.${fmt === "excel" ? "xlsx" : fmt}`

  try {
    await db.prepare(
      "INSERT INTO reports (name, type, format, fromDate, toDate, generatedAt, status, filename) VALUES (?, ?, ?, ?, ?, datetime('now'), 'completed', ?)"
    ).run(name, type, fmt, fromDate || null, toDate || null, filename)

    return NextResponse.json({
      success: true,
      filename,
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
