// components/auth/google-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function GoogleButton({ label }: { label: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Just trigger the sign-in without redirecting
      await signIn('google', { callbackUrl: '/api/auth/signin' })
    } catch (error) {
      console.error("Google sign in error:", error)
      alert("Google sign in failed: " + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-transparent"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
              <span className="sr-only">Sign in with Google</span>
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.98h5.64c-.24 1.44-1.7 4.22-5.64 4.22-3.4 0-6.17-2.81-6.17-6.3S8.6 5.8 12 5.8c1.94 0 3.25.82 3.99 1.53l2.72-2.63C17.29 3.1 14.86 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.77 0 9.6-4.05 9.6-9.77 0-.66-.07-1.16-.16-1.67H12z"
          />
        </svg>
        {isLoading ? "Signing in..." : label}
    </Button>
  )
}
