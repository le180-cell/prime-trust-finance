import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const rows = await db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[]
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value

  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await request.json()
  const upsert = db.prepare(
    "INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt"
  )

  const tx = db.transaction(async () => {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") await upsert.run(key, value)
    }
  })
  await tx()

  await logAudit("update", "settings", undefined, Object.keys(body).join(", "))
  return NextResponse.json({ success: true })
}
