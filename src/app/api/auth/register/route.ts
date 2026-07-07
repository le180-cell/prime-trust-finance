import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, signToken } from "@/lib/auth"

export async function POST(request: Request) {
  const {
    firstName,
    lastName,
    username,
    gender,
    dateOfBirth,
    nationalId,
    email,
    phone,
    district,
    sector,
    cell,
    village,
    occupation,
    employer,
    monthlyIncome,
    maritalStatus,
    securityQuestion,
    profilePhoto,
    nationalIdDocument,
    password,
  } = await request.json()

  if (!firstName || !lastName || !username || !email || !password) {
    return NextResponse.json({ error: "First name, last name, username, email, and password are required." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username)
  if (existing) {
    return NextResponse.json({ error: "An account with this email or username already exists." }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const result = db.prepare(
    "INSERT INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)"
  ).run(email, username, passwordHash, "member")

  db.prepare(
    `INSERT INTO members (
      firstName,
      lastName,
      username,
      gender,
      dateOfBirth,
      nationalId,
      email,
      phone,
      district,
      sector,
      cell,
      village,
      occupation,
      employer,
      monthlyIncome,
      maritalStatus,
      securityQuestion,
      profilePhoto,
      nationalIdDocument
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    firstName,
    lastName,
    username,
    gender || null,
    dateOfBirth || null,
    nationalId || null,
    email,
    phone || null,
    district || null,
    sector || null,
    cell || null,
    village || null,
    occupation || null,
    employer || null,
    monthlyIncome || null,
    maritalStatus || null,
    securityQuestion || null,
    profilePhoto || null,
    nationalIdDocument || null,
  )

  const token = await signToken({ userId: result.lastInsertRowid as number, email, role: "member" })

  const response = NextResponse.json({ success: true, user: { id: result.lastInsertRowid, email, username, role: "member" } }, { status: 201 })
  response.cookies.set("ias_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return response
}
