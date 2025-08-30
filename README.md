# Highway Delight App — Local Setup

This is a full-stack Next.js App Router application with:

- MongoDB via Mongoose
- Authentication via NextAuth v4 (Credentials provider) + `bcryptjs`
- Zod validation
- Tailwind CSS v4 + shadcn/ui components
- SWR for client-side data fetching

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- MongoDB (either local installation or MongoDB Atlas cloud database)

## 1) Install dependencies

```bash
npm install

# or

pnpm install

# or

yarn
```

## 2) Configure environment variables

Create a **.env.local** file at the project root with the following content:

```bash

# MongoDB Configuration

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=highway-delight

# NextAuth Configuration

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

**Important**: Replace `your-nextauth-secret` with a secure random string. You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3) Setup Database (Optional)

The database will be created automatically when you first run the application. However, you can run the setup script to verify your MongoDB connection:

```bash
npm run setup-db
```

## 4) Run the dev server

```bash
npm run dev
```
Open http://localhost:3000.

## 5) Build and run production

```bash
npm run build
npm run start
```

## Auth Overview

- Credentials login uses NextAuth at `app/api/auth/[...nextauth]/route.ts`.
- Signup endpoint: `POST /api/register` with `{ name, email, password }`.
- Middleware (`middleware.ts`) protects `/dashboard` and `/private/*`.
- Public routes allowed: `/`, `/login`, `/signup`, `/api/register`, `/api/auth/*`.
- Session strategy is JWT; `session.user` includes `id`, `name`, `email`, `image`.

### Pages

- `app/(auth)/signup/page.tsx` — uses shared `components/AuthForm.tsx` (mode="signup").
- `app/(auth)/login/page.tsx` — uses shared `components/AuthForm.tsx` (mode="login").
- `app/dashboard/page.tsx` — protected, uses `getServerSession(authOptions)` and shows user name.
- `components/auth/logout-button.tsx` — uses `signOut()`.

### Client helpers

- `lib/api-client.ts` exposes:
  - `register({ name, email, password })`
  - `login({ email, password })` via `signIn('credentials', { redirect: false })`
  - `getCurrentUserServer()`/`getCurrentUserClient()` examples using NextAuth APIs

## Notes

- Tailwind v4 is configured in `app/globals.css` using `@import 'tailwindcss'`. No tailwind.config.js is needed.
- If you see auth or DB errors, confirm `.env.local` is correct and that MongoDB is reachable.
- This project uses the Next.js App Router. API routes are under `app/api/*`. Pages are under `app/*`.

## Seed a test user (optional)

```bash
npm run seed
```
Environment overrides (optional): `SEED_EMAIL`, `SEED_NAME`, `SEED_PASSWORD`.

## Database Configuration

- **Automatic Database Creation**: The database and collections are created automatically when the application starts
- **Database Name**: Defaults to `highway-delight` (configurable via `MONGODB_DB` environment variable)
- **Collections**: `users` and `notes` collections are created automatically with proper indexes
- **Connection**: You can optionally provide `MONGODB_DB` in your `.env.local`. If present, the app will connect to `${MONGODB_URI}/${MONGODB_DB}`.
- **Atlas Setup**: To create a new database in Atlas: create a cluster, add a database user with a password, and use the connection string (without the db name) as `MONGODB_URI`. Then set `MONGODB_DB` to the desired database name.
- **Local Development**: When running locally, visit `/signup` to create a new user and `/login` to authenticate via NextAuth.

## User Data Isolation

- Each user's notes are stored with their user ID in the database
- Notes are automatically filtered by the authenticated user
