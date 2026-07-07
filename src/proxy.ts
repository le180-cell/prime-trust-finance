import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, getAuthCookieName } from "@/lib/auth-token"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(getAuthCookieName())?.value
  const payload = token ? verifyToken(token) : null

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!payload) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
