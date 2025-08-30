// app/api/notes/[id]/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Note } from "@/models/note"
import { getUserFromRequest } from "@/lib/auth"

type Params = { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getUserFromRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const note = await Note.findOne({ _id: params.id, userId: user.sub })
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await Note.deleteOne({ _id: note._id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
