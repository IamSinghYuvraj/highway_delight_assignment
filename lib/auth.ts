// lib/auth.ts
import { cookies, headers } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

function getSecret(): Uint8Array {
  const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"
  return new TextEncoder().encode(JWT_SECRET)
}

export type JwtPayload = {
  sub: string
  email: string
  iat?: number
  exp?: number
}

export async function signJwt(payload: Omit<JwtPayload, "iat" | "exp">) {
  const secret = getSecret()
  const token = await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
  return token
}

export async function verifyJwt(token: string) {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    iat: payload.iat as number | undefined,
    exp: payload.exp as number | undefined,
  } as JwtPayload
}

export async function getBearerTokenFromHeaders(): Promise<string | null> {
  const h = await headers()
  const auth = h.get("authorization") || h.get("Authorization")
  if (!auth) return null
  const [type, token] = auth.split(" ")
  if (type?.toLowerCase() !== "bearer" || !token) return null
  return token
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  return token || null
}

export async function getUserFromRequest() {
  const headerToken = await getBearerTokenFromHeaders()
  if (headerToken) {
    try {
      return await verifyJwt(headerToken)
    } catch (e) {
      // Token is invalid or expired. This is expected, but we can log for debugging.
      console.info("Invalid header token:", e instanceof Error ? e.message : String(e))
    }
  }
  const cookieToken = await getTokenFromCookies()
  if (cookieToken) {
    try {
      return await verifyJwt(cookieToken)
    } catch (e) {
      console.info("Invalid cookie token:", e instanceof Error ? e.message : String(e))
    }
  }
  return null
}
