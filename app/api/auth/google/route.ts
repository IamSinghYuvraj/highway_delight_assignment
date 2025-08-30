// app/api/auth/google/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { signJwt } from "@/lib/auth"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

function getGoogleAuthURL(origin: string) {
  const callback = `${origin}/api/auth/google`
  const scope = ["openid", "email", "profile"].join(" ")
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: callback,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function exchangeCodeForTokens(code: string, origin: string) {
  const callback = `${origin}/api/auth/google`
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID || "",
    client_secret: GOOGLE_CLIENT_SECRET || "",
    redirect_uri: callback,
    grant_type: "authorization_code",
  })
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  if (!res.ok) {
    throw new Error("Failed to exchange code for tokens")
  }
  return res.json() as Promise<{ access_token: string; id_token?: string; token_type: string }>
}

async function getGoogleUser(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error("Failed to fetch Google user")
  return res.json() as Promise<{ id: string; email: string; name?: string }>
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code = req.nextUrl.searchParams.get("code")

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  if (!code) {
    const authUrl = getGoogleAuthURL(origin)
    return NextResponse.redirect(authUrl)
  }

  try {
    const { access_token } = await exchangeCodeForTokens(code, origin)
    const gUser = await getGoogleUser(access_token)

    await connectToDatabase()

    let user = await User.findOne({ $or: [{ googleId: gUser.id }, { email: gUser.email }] })
    if (!user) {
      user = await User.create({ email: gUser.email, googleId: gUser.id })
    } else if (!user.googleId) {
      user.googleId = gUser.id
      await user.save()
    }

    const token = await signJwt({ sub: user._id.toString(), email: user.email })

    const res = NextResponse.redirect(new URL("/dashboard", origin))
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res

  } catch (e) {
    console.error("Google OAuth failed:", e)
    return NextResponse.redirect(new URL("/login?error=google_oauth_failed", origin))
  }
}
