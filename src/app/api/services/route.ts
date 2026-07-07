import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const services = db.prepare("SELECT * FROM services ORDER BY sortOrder ASC").all()
  return NextResponse.json(services)
}
