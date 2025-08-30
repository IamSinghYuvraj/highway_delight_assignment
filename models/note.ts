// models/note.ts
import mongoose, { Schema, type Model, type Types } from "mongoose"

export type INote = {
  _id: string
  title: string
  content: string
  userId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
)

export const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema)
