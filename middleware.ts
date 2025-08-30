import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]) 

function isStatic(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/public")) return true
  if (pathname.match(/\.(png|jpg|jpeg|svg|css|js|map|ico)$/)) return true
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isStatic(pathname)) return NextResponse.next()

  // Allow NextAuth routes and register API
  if (pathname.startsWith("/api/auth")) return NextResponse.next()
  if (pathname === "/api/register") return NextResponse.next()

  // If already authenticated, prevent visiting login/signup
  if (PUBLIC_PATHS.has(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (token && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Protect private pages under /dashboard and /private
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/private")
  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/private/:path*",
    "/login",
    "/signup",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
