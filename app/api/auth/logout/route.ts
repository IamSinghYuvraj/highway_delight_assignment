// app/api/auth/logout/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  // Create response with success message
  const response = NextResponse.json({ 
    success: true,
    message: "Successfully logged out"
  })
  
  // Clear the JWT token cookie
  response.cookies.set("token", "", { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax", 
    path: "/", 
    maxAge: 0 // This immediately expires the cookie
  })
  
  return response
}
