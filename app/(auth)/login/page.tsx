// app/(auth)/login/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AuthForm from "@/components/AuthForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) redirect("/home")
  return (
    <main className="min-h-dvh flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 text-balance">Welcome back</h1>
          <p className="text-sm text-gray-600">Log in to continue taking notes</p>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-gray-600">
          Don{"'"}t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
