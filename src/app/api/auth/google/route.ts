import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", origin))
  }

  const state = crypto.randomBytes(32).toString("hex")

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&access_type=offline` +
      `&state=${state}`,
  )

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5,
    path: "/",
  })

  return response
}
