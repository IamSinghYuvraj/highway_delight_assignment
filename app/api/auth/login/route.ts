// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { loginSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"
import { signJwt } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { email, password } = parsed.data

    console.log(`🔐 Attempting login for: ${email}`)

    // Connect to database and ensure it's initialized
    await connectToDatabase()

    // First check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return NextResponse.json({ 
        error: "User not found. Please sign up first." 
      }, { status: 404 })
    }

    // Check if user has password (not a Google OAuth user)
    if (!user.hashedPassword) {
      console.log(`❌ User has no password: ${email}`)
      return NextResponse.json({ 
        error: "Invalid credentials" 
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`)
      return NextResponse.json({ 
        error: "Invalid credentials" 
      }, { status: 401 })
    }

    console.log(`✅ Login successful for: ${email}`)

    // Generate JWT token
    const token = await signJwt({ 
      sub: user._id.toString(), 
      email: user.email 
    })

    // Update user login metadata and persist the last issued JWT
    const lastLoginIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { lastJwt: token, lastLoginAt: new Date(), lastLoginIp },
        $inc: { loginCount: 1 }
      }
    )

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: { 
        id: user._id.toString(), 
        email: user.email 
      }
    })

    // Set JWT token as httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log(`🍪 JWT token set for: ${email}`)

    return response
    
  } catch (e) {
    console.error("Login error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

