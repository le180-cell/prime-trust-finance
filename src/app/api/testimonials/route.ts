import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY sortOrder ASC").all()
  return NextResponse.json(testimonials)
}
