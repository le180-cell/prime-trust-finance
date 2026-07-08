import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const rows = await db.prepare("SELECT * FROM news_items ORDER BY date DESC").all()
    return NextResponse.json(rows)
  } catch { return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const { newsItems } = await request.json()
    await db.prepare("DELETE FROM news_items").run()
    for (const item of newsItems) {
      await db.prepare(
        "INSERT INTO news_items (title, slug, excerpt, content, image, published, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(item.title, item.slug, item.excerpt || "", item.content || "", item.image || null, item.published ?? 1, item.date)
    }
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to save news" }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const { title, slug, excerpt, content, image, published, date } = await request.json()
    await db.prepare(
      "INSERT INTO news_items (title, slug, excerpt, content, image, published, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(title, slug, excerpt || "", content || "", image || null, published ?? 1, date)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to create news" }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  try {
    if (id) await db.prepare("DELETE FROM news_items WHERE id = ?").run(Number(id))
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to delete news" }, { status: 500 }) }
}
