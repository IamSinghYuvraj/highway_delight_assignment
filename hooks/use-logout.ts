"use client"

import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Important for cookie handling
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (data.success) {
        // Redirect to login page with success message
        router.replace('/login?logout=success')
        
        // Force a page refresh to clear any remaining state
        router.refresh()
      } else {
        // Even if the API call fails, redirect to login
        router.replace('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if the API call fails, redirect to login
      router.replace('/login')
    }
  }

  return { logout }
}
