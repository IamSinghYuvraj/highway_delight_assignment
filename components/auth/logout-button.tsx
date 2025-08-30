"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  return (
    <Button 
      onClick={async () => {
        await signOut({ redirect: true, callbackUrl: "/login?logout=success" })
        router.refresh()
      }}
      className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black"
    >
      Log out
    </Button>
  )
}
