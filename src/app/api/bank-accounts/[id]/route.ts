import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { id } = await params

  const account = db.prepare(
    "SELECT id FROM linked_accounts WHERE id = ? AND userId = ?"
  ).get(Number(id), session.id)

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 })
  }

  db.prepare("DELETE FROM transactions WHERE accountId = ?").run(Number(id))
  db.prepare("DELETE FROM linked_accounts WHERE id = ?").run(Number(id))

  return NextResponse.json({ success: true })
}
