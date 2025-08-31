// models/Note.ts
import mongoose, { Schema, model, models } from "mongoose"

export type INote = {
  _id?: string
  title: string
  content: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
)

// In dev with hot-reload, a previously-compiled model may persist with an old schema.
// Clear it so the latest schema is used.
if (mongoose.models?.Note) {
  delete mongoose.models.Note
}

const Note = models?.Note || model<INote>("Note", noteSchema);

export default Note;