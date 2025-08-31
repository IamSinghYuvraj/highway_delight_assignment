"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true, 
        callbackUrl: "/login?logout=success" 
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback redirect
      router.push("/login?logout=success")
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black"
    >
      Log out
    </Button>
  )
}
