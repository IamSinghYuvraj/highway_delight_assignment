import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // If user is authenticated and tries to access auth pages, redirect to home
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Handle post-authentication redirect
    if (pathname === '/api/auth/signin' && token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow auth-related and public routes (no session required)
        if (
          pathname.startsWith("/api/auth") || // NextAuth routes
          pathname === "/" || // Landing page
          pathname === "/login" ||
          pathname === "/signup"
        ) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (all API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};