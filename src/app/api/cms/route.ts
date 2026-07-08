import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const rows = await db.prepare("SELECT section, key, value FROM cms_content ORDER BY section, key").all() as { section: string; key: string; value: string }[]
    const grouped: Record<string, Record<string, string>> = {}
    for (const row of rows) {
      if (!grouped[row.section]) grouped[row.section] = {}
      grouped[row.section][row.key] = row.value
    }
    return NextResponse.json(grouped)
  } catch {
    return NextResponse.json({ error: "Failed to fetch CMS content" }, { status: 500 })
  }
}
