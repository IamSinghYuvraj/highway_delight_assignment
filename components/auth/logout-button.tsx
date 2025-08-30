"use client"

import { useLogout } from "@/hooks/use-logout"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { logout } = useLogout()

  return (
    <Button 
      onClick={() => logout()}
      className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black"
    >
      Log out
    </Button>
  )
}
