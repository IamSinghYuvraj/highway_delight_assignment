// app/api/register/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { signupSchema } from "@/lib/validators"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = parsed.data
    await connectToDatabase()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
    })
  } catch (e) {
    console.error("Register error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
