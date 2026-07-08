import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const policies = await db.prepare("SELECT * FROM interest_policies ORDER BY type, name").all()
    return NextResponse.json(policies)
  } catch {
    return NextResponse.json({ error: "Failed to fetch interest policies" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { policies } = await request.json()
    await db.prepare("DELETE FROM interest_policies").run()
    for (const p of policies) {
      await db.prepare(
        "INSERT INTO interest_policies (name, rate, type, minBalance, maxBalance, active) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(p.name, p.rate, p.type || "savings", p.minBalance || 0, p.maxBalance || 999999999, p.active ?? 1)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to save interest policies" }, { status: 500 })
  }
}
