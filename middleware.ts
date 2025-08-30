import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const AUTH_REQUIRED_API_PREFIXES = ["/api/notes"]
const AUTH_PAGES = ["/dashboard"]
const AUTH_EXEMPT_PAGES = ["/login", "/signup", "/api/auth"]

function isStatic(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/public")) return true
  if (pathname.match(/\.(png|jpg|jpeg|svg|css|js|map|ico)$/)) return true
  return false
}

async function verifyToken(token?: string | null) {
  if (!token) return false
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    const encoder = new TextEncoder()
    await jwtVerify(token, encoder.encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let static assets and Next internals through
  if (isStatic(pathname)) return NextResponse.next()

  // Extract token from cookie or authorization header
  const cookieToken = req.cookies.get("token")?.value || null
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization")
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
  const token = cookieToken || headerToken

  // If user tries to access login/signup while authenticated, send them to dashboard
  if ((pathname === "/login" || pathname === "/signup") && await verifyToken(token)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect certain API prefixes
  for (const prefix of AUTH_REQUIRED_API_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      const ok = await verifyToken(token)
      if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      return NextResponse.next()
    }
  }

  // Protect application pages
  for (const p of AUTH_PAGES) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("redirectTo", pathname)
        return NextResponse.redirect(url)
      }
      const ok = await verifyToken(token)
      if (!ok) {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("redirectTo", pathname)
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }
  }

  // Allow other pages
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/notes/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
}
