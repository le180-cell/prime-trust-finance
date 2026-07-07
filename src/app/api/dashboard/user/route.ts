import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = db
    .prepare("SELECT * FROM members WHERE email = ?")
    .get(session.email) as Record<string, unknown> | undefined

  const memberId = member
    ? `IAS-${String(member.firstName || "").slice(0, 2).toUpperCase()}${String(member.lastName || "").slice(0, 2).toUpperCase()}-${(member.id as number).toString().padStart(4, "0")}`
    : `IAS-${session.id.toString().padStart(4, "0")}`

  const firstName = (member?.firstName as string) || session.username || "Member"
  const lastName = (member?.lastName as string) || ""
  const fullName = `${firstName} ${lastName}`.trim()

  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      username: session.username,
      role: session.role,
      firstName,
      lastName,
      fullName,
      memberId,
      phone: (member?.phone as string) || "+250 788 123 456",
      district: (member?.district as string) || "Kigali",
      occupation: (member?.occupation as string) || "Member",
      profilePhoto: (member?.profilePhoto as string) || null,
      memberSince: (member?.memberSince as string) || "2023-01-15",
      verified: true,
    },
  })
}
