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
    password,
  } = await request.json()

  if (!firstName || !lastName || !username || !email || !password) {
    return NextResponse.json({ error: "First name, last name, username, email, and password are required." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const existing = await db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username)
  if (existing) {
    return NextResponse.json({ error: "An account with this email or username already exists." }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const result = await db.prepare(
    "INSERT INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)"
  ).run(email, username, passwordHash, "user")

  const userId = result.lastInsertRowid as number

  await db.prepare(
    `INSERT INTO members (
      firstName, lastName, username, gender, dateOfBirth,
      email, phone, district, sector, cell, village,
      occupation, employer, monthlyIncome, maritalStatus,
      securityQuestion, profilePhoto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    firstName, lastName, username,
    gender || null, dateOfBirth || null,
    email, phone || null, district || null,
    sector || null, cell || null, village || null,
    occupation || null, employer || null, monthlyIncome || null,
    maritalStatus || null, securityQuestion || null,
    profilePhoto || null,
  )

  const member = await db.prepare("SELECT id FROM members WHERE email = ?").get(email) as { id: number } | undefined

  if (member) {
    await db.prepare(
      "INSERT INTO savings_accounts (memberId, balance, interestRate, monthlyContribution, totalDeposits, totalWithdrawn, interestEarned) VALUES (?, 0, 4.5, 0, 0, 0, 0)"
    ).run(member.id)
    await db.prepare(
      "INSERT INTO notifications (memberId, title, message, type) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Welcome to IAS!", "Your account has been created successfully. Start saving today!", "success")
    await db.prepare(
      "INSERT INTO member_activities (memberId, action, description, category) VALUES (?, ?, ?, ?)"
    ).run(member.id, "Account Created", "Member registration completed successfully.", "auth")
  }

  const token = await signToken({ userId, email, role: "user" })

  const response = NextResponse.json({ success: true, user: { id: result.lastInsertRowid, email, username, role: "user" } }, { status: 201 })
  response.cookies.set("ias_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return response
}
