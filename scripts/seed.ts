// scripts/seed.ts
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../lib/db'
import { User } from '../models/user'

async function main() {
  await connectToDatabase()
  const email = process.env.SEED_EMAIL || 'test@example.com'
  const name = process.env.SEED_NAME || 'Test User'
  const password = process.env.SEED_PASSWORD || 'password123'

  const existing = await User.findOne({ email })
  if (existing) {
    console.log('User already exists:', email)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({ name, email, passwordHash })
  console.log('Seeded user:', { email, password })
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
