import { describe, it, expect, beforeAll } from 'vitest'
import { signJwt, verifyJwt } from '../lib/auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-which-is-long-enough'
})

describe('auth jwt', () => {
  it('signs and verifies a payload', async () => {
    const token = await signJwt({ sub: '123', email: 'a@b.com' })
    expect(typeof token).toBe('string')
    const payload = await verifyJwt(token)
    expect(payload.sub).toBe('123')
    expect(payload.email).toBe('a@b.com')
  })
})
