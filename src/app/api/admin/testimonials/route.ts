import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY sortOrder ASC").all()
  return NextResponse.json(testimonials)
}

export async function POST(request: Request) {
  try {
    const { name, role, quote, rating, sortOrder } = await request.json()
    if (!name || !quote) return NextResponse.json({ error: "Name and quote are required" }, { status: 400 })
    const maxOrder = db.prepare("SELECT COALESCE(MAX(sortOrder), 0) + 1 AS nextOrder FROM testimonials").get() as { nextOrder: number }
    const result = db.prepare("INSERT INTO testimonials (name, role, quote, rating, sortOrder) VALUES (?, ?, ?, ?, ?)").run(name, role || "", quote, rating || 5, sortOrder ?? maxOrder.nextOrder)
    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, role, quote, rating, sortOrder } = await request.json()
    if (!id || !name || !quote) return NextResponse.json({ error: "ID, name, and quote are required" }, { status: 400 })
    db.prepare("UPDATE testimonials SET name = ?, role = ?, quote = ?, rating = ?, sortOrder = ? WHERE id = ?").run(name, role || "", quote, rating || 5, sortOrder ?? 0, id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })
    db.prepare("DELETE FROM testimonials WHERE id = ?").run(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
