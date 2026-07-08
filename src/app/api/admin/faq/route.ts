import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const rows = await db.prepare("SELECT * FROM faq_items ORDER BY sortOrder").all()
    return NextResponse.json(rows)
  } catch { return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const { faqItems } = await request.json()
    await db.prepare("DELETE FROM faq_items").run()
    for (let i = 0; i < faqItems.length; i++) {
      const item = faqItems[i]
      await db.prepare("INSERT INTO faq_items (question, answer, sortOrder) VALUES (?, ?, ?)").run(item.question, item.answer, i)
    }
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to save FAQ" }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const { question, answer } = await request.json()
    const maxOrder = await db.prepare("SELECT COALESCE(MAX(sortOrder), -1) + 1 as next FROM faq_items").get() as { next: number }
    await db.prepare("INSERT INTO faq_items (question, answer, sortOrder) VALUES (?, ?, ?)").run(question, answer, maxOrder.next)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to add FAQ" }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  try {
    if (id) await db.prepare("DELETE FROM faq_items WHERE id = ?").run(Number(id))
    else await db.prepare("DELETE FROM faq_items").run()
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 }) }
}
