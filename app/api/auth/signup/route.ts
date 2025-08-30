// app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { signupSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"
import { signJwt } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { email, password } = parsed.data

    console.log(`📝 Attempting to create user: ${email}`)

    // Connect to database and ensure it's initialized
    await connectToDatabase()

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      console.log(`❌ User already exists: ${email}`)
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const signupIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined
    const user = await User.create({ email, hashedPassword, provider: "local", signupIp })

    console.log(`✅ User created successfully: ${email}`)

    // Generate and store a JWT for record (do NOT set cookie here). User will log in to get session cookie.
    const token = await signJwt({ sub: user._id.toString(), email: user.email })
    await User.updateOne({ _id: user._id }, { $set: { lastJwt: token } })

    // Return success response without setting any cookies - client should redirect to login page
    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please log in.",
      user: { id: user._id.toString(), email: user.email }
    })
    
  } catch (e) {
    console.error("Signup error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

