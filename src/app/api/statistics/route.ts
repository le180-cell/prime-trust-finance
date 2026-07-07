import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const stats = await db.prepare("SELECT * FROM statistics ORDER BY sortOrder ASC").all()
  return NextResponse.json(stats)
}
