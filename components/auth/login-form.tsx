// components/auth/login-form.tsx
"use client"

import { useState, useEffect, type FormEvent } from "react"
import { loginSchema } from "@/lib/validators"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import GoogleButton from "./google-button"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session } = useSession()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.push("/home")
    }
  }, [session, router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (params.get("error")) {
        setError(params.get("error") || "Authentication failed")
      }
      if (params.get("logout") === "success") {
        setError(null)
        setSuccess("Successfully logged out")
      }
      if (params.get("message")) {
        setSuccess(params.get("message"))
        setError(null)
      }
    }
  }, [params])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue: { message: string }) => issue.message).join(". "))
      return
    }

    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/home")
      }
      
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <div key={error} className="mb-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div key={success} className="mb-3 text-sm text-green-600">
            {success}
          </div>
        )}
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>
          <GoogleButton label="Log in with Google" />
        </form>
      </CardContent>
    </Card>
  )
}
