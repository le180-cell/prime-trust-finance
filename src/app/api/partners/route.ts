import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const partners = db.prepare("SELECT * FROM partners ORDER BY sortOrder ASC").all()
  return NextResponse.json(partners)
}
