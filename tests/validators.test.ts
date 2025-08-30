import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema } from '../lib/validators'

describe('validators', () => {
  it('accepts valid signup data', () => {
    const res = signupSchema.safeParse({ email: 'a@b.com', password: 'password123' })
    expect(res.success).toBe(true)
  })

  it('rejects short password for signup', () => {
    const res = signupSchema.safeParse({ email: 'a@b.com', password: 'short' })
    expect(res.success).toBe(false)
  })

  it('accepts login with any non-empty password', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(res.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const res = signupSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(res.success).toBe(false)
  })
})
