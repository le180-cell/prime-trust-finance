import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const stats = await db.prepare("SELECT * FROM statistics ORDER BY sortOrder ASC").all()
  return NextResponse.json(stats)
}

export async function PUT(request: Request) {
  try {
    const { statistics } = await request.json() as {
      statistics: Array<{ id: number; label: string; value: number; suffix: string; icon: string }>
    }
    const stmt = db.prepare("UPDATE statistics SET label = ?, value = ?, suffix = ?, icon = ? WHERE id = ?")
    const updateMany = db.transaction(async (items: any) => {
      for (const s of items) {
        await stmt.run(s.label, s.value, s.suffix, s.icon, s.id)
      }
    })
    await updateMany(statistics)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
