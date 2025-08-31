// models/user.ts
import bcrypt from "bcryptjs"
import mongoose, { Schema, model, models } from "mongoose"

export type IUser = {
  _id?: string
  name?: string
  email: string
  password: string
  googleId?: string
  profilePicture?: string
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: undefined }, // Made optional for Google users
    googleId: { type: String, required: false, unique: true, sparse: true },
    profilePicture: { type: String, required: false },
  },
  { timestamps: true }
)

// Custom validation to ensure either password or googleId is present
userSchema.pre("save", async function(next) {
  // Check if user has either password or googleId
  if ((!this.password || this.password === "") && !this.googleId) {
    return next(new Error("User must have either a password or Google ID"));
  }
  
  // Only hash password if it's modified and not empty (for Google users)
  if (this.isModified("password") && this.password && this.password !== "") {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// In dev with hot-reload, a previously-compiled model may persist with an old schema.
// Clear it so the latest schema is used.
if (mongoose.models?.User) {
  delete mongoose.models.User
}

const User = models?.User || model<IUser>("User", userSchema);

export default User;