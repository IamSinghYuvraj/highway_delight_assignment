// lib/api-client.ts
import axios from 'axios'
import { signIn, getSession } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function register(data: { name: string; email: string; password: string }) {
  const res = await axios.post('/api/register', data)
  return res.data as { id: string; name: string; email: string; image?: string | null }
}

export async function login(data: { email: string; password: string }) {
  const result = await signIn('credentials', { ...data, redirect: false })
  if (result?.error) throw new Error(result.error)
  return result
}

export async function getCurrentUserClient() {
  const session = await getSession()
  return session?.user ?? null
}

export async function getCurrentUserServer() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}
