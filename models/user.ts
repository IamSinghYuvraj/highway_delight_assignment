// models/user.ts
import mongoose, { Schema, type Model } from "mongoose"

export type IUser = {
  _id: string
  name: string
  email: string
  passwordHash: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
