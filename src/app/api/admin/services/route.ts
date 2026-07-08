import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const rows = await db.prepare("SELECT * FROM services ORDER BY sortOrder").all()
    return NextResponse.json(rows)
  } catch { return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const { services } = await request.json()
    await db.prepare("DELETE FROM services").run()
    for (let i = 0; i < services.length; i++) {
      const s = services[i]
      await db.prepare("INSERT INTO services (title, description, icon, sortOrder) VALUES (?, ?, ?, ?)").run(s.title, s.description, s.icon, i)
    }
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to save services" }, { status: 500 }) }
}
