// models/user.ts
import mongoose, { Schema, type Model } from "mongoose"

export type IUser = {
  _id: string
  email: string
  hashedPassword?: string
  googleId?: string
  lastLoginAt?: Date
  loginCount?: number
  lastJwt?: string
  lastLoginIp?: string
  signupIp?: string
  provider?: "local" | "google"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    hashedPassword: { type: String },
    googleId: { type: String, index: true },
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    lastJwt: { type: String },
    lastLoginIp: { type: String },
    signupIp: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
