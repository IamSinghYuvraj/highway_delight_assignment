import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import UserModel from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectToDatabase();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email. Please sign up first.");
          }

          // Check if user has a password (not a Google-only user)
          if (!user.password || user.password === "" || user.password === undefined) {
            throw new Error("This email is registered with Google. Please sign in with Google.");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.profilePicture,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          await connectToDatabase();
          const email = user.email;
          if (!email) return false;
          
          // Check if user exists in database
          let dbUser = await UserModel.findOne({ email });
          
          if (!dbUser) {
            // Create new user for Google OAuth
            dbUser = await UserModel.create({
              email,
              googleId: user.id,
              name: profile?.name || user.name,
              profilePicture: user.image,
              password: undefined, // Google users don't have a password
            });
          } else {
            // Update existing user's Google info if needed
            if (!dbUser.googleId) {
              await UserModel.findByIdAndUpdate(dbUser._id, {
                googleId: user.id,
                profilePicture: user.image,
              });
            }
          }
          
          // Always allow Google users to sign in after account creation/verification
          (user as any).id = dbUser._id.toString();
          return true;
        }
        return true;
      } catch (err) {
        console.error("signIn callback failed:", err);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // On first sign in, persist the DB id onto the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get user from request
export async function getUserFromRequest() {
  const { getServerSession } = await import('next-auth/next');
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || null,
    image: session.user.image || null
  };
}