// app/api/notes/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Note } from "@/models/note"
import { getUserFromRequest } from "@/lib/auth"
import { noteCreateSchema } from "@/lib/validators"

export async function GET() {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      console.log("❌ Unauthorized access to notes")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`📝 Fetching notes for user: ${user.email}`)

    await connectToDatabase()
    const notes = await Note.find({ userId: user.sub }).sort({ createdAt: -1 }).lean()
    
    console.log(`✅ Found ${notes.length} notes for user: ${user.email}`)
    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      console.log("❌ Unauthorized access to create notes")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = noteCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    console.log(`📝 Creating note for user: ${user.email}`)

    await connectToDatabase()
    const note = await Note.create({
      title: parsed.data.title,
      content: parsed.data.content,
      userId: user.sub,
    })
    
    console.log(`✅ Note created for user: ${user.email}`)
    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
