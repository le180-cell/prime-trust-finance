import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const news = await db
    .prepare("SELECT * FROM news_items WHERE published = 1 ORDER BY date DESC")
    .all()
  return NextResponse.json(news)
}
