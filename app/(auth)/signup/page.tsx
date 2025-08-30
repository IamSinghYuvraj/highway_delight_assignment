// app/(auth)/signup/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AuthForm from "@/components/AuthForm"

export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) redirect("/dashboard")
  return (
    <main className="min-h-dvh flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 text-balance">Create your account</h1>
          <p className="text-sm text-gray-600">Start organizing your notes</p>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
