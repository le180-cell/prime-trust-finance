import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const rows = await db.prepare("SELECT * FROM partners ORDER BY sortOrder").all()
    return NextResponse.json(rows)
  } catch { return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const { partners } = await request.json()
    await db.prepare("DELETE FROM partners").run()
    for (let i = 0; i < partners.length; i++) {
      const p = partners[i]
      await db.prepare("INSERT INTO partners (name, logo, sortOrder) VALUES (?, ?, ?)").run(p.name, p.logo || null, i)
    }
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to save partners" }, { status: 500 }) }
}
