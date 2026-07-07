import { NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { hashPassword, signToken, getAuthCookieName } from "@/lib/auth"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(new URL("/login?error=google_denied", request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=google_invalid", request.url))
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get("google_oauth_state")?.value

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/login?error=google_state", request.url))
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url))
  response.cookies.delete("google_oauth_state")

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url))
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json() as { id_token?: string; error?: string }

    if (!tokens.id_token) {
      return NextResponse.redirect(new URL("/login?error=google_token", request.url))
    }

    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64").toString(),
    ) as { email?: string; name?: string; sub: string }
    const googleEmail = payload.email

    if (!googleEmail) {
      return NextResponse.redirect(new URL("/login?error=google_email", request.url))
    }

    let user = await db
      .prepare("SELECT id, email, username, role FROM users WHERE email = ?")
      .get(googleEmail) as { id: number; email: string; username: string | null; role: string } | undefined

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex")
      const passwordHash = await hashPassword(randomPassword)
      const baseUsername = googleEmail.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase()

      const result = await db
        .prepare("INSERT INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, 'user')")
        .run(googleEmail, baseUsername, passwordHash)

      user = { id: result.lastInsertRowid as number, email: googleEmail, username: baseUsername, role: "user" }
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role })
    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_error", request.url))
  }
}
