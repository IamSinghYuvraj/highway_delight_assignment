// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Invalid email or password")
        await connectToDatabase()
        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.passwordHash) throw new Error("Invalid email or password")
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) throw new Error("Invalid email or password")
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.name = user.name
        token.email = user.email
        token.picture = (user as any).image || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        session.user.name = token.name as string | null
        session.user.email = token.email as string | null
        session.user.image = (token.picture as string | null) || null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
