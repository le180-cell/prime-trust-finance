import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  await db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(session.id)

  return NextResponse.json({ success: true, message: "You are now an admin. Log out and log back in." })
}
