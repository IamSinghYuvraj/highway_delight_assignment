// components/AuthForm.tsx
"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { signupSchema, loginSchema } from "@/lib/validators"
import { register as apiRegister, login as apiLogin } from "@/lib/api-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type AuthFormMode = "login" | "signup"

export default function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter()
  const params = useSearchParams()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // surface url messages
  useEffect(() => {
    const message = params.get("message")
    const logout = params.get("logout")
    if (message) setSuccess(message)
    else if (logout === "success") setSuccess("Successfully logged out")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ name, email, password })
        if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join(". "))
        setLoading(true)
        await apiRegister(parsed.data)
        router.push("/login?message=" + encodeURIComponent("Account created successfully. Please log in."))
      } else {
        const parsed = loginSchema.safeParse({ email, password })
        if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join(". "))
        setLoading(true)
        await apiLogin(parsed.data)
        router.replace("/dashboard")
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-600">{success}</div>}
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          {mode === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Minimum 8 characters" : "••••••••"} required />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? (mode === "signup" ? "Creating account..." : "Logging in...") : (mode === "signup" ? "Sign up" : "Log in")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
