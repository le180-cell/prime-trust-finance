import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section")

  try {
    if (section) {
      const rows = await db.prepare("SELECT * FROM cms_content WHERE section = ? ORDER BY key").all(section)
      return NextResponse.json(rows)
    }
    const rows = await db.prepare("SELECT * FROM cms_content ORDER BY section, key").all()
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: "Failed to fetch CMS content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { section, key, value } = await request.json()

  if (!section || !key) {
    return NextResponse.json({ error: "Section and key are required" }, { status: 400 })
  }

  try {
    await db.prepare(
      "INSERT INTO cms_content (section, key, value, updatedAt) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(section, key) DO UPDATE SET value = ?, updatedAt = datetime('now')"
    ).run(section, key, value, value)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update CMS content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { section, key, value } = await request.json()

  if (!section || !key || !value) {
    return NextResponse.json({ error: "Section, key, and value are required" }, { status: 400 })
  }

  try {
    await db.prepare(
      "INSERT OR IGNORE INTO cms_content (section, key, value) VALUES (?, ?, ?)"
    ).run(section, key, value)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to create CMS content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section")
  const key = searchParams.get("key")

  if (!section || !key) {
    return NextResponse.json({ error: "Section and key are required" }, { status: 400 })
  }

  try {
    await db.prepare("DELETE FROM cms_content WHERE section = ? AND key = ?").run(section, key)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete CMS content" }, { status: 500 })
  }
}
