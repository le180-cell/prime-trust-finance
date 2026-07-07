import { NextResponse } from "next/server"

function clearCookie(response: NextResponse) {
  response.cookies.set("ias_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const response = NextResponse.json({ success: true, redirect: `${origin}/login` })
  return clearCookie(response)
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  return clearCookie(NextResponse.redirect(new URL("/login", origin)))
}
