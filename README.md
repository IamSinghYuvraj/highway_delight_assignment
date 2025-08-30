# Highway Delight App — Local Setup

This is a full-stack Next.js App Router application with:

- MongoDB via Mongoose
- JWT auth using `jose` and `bcryptjs`
- Zod validation
- Tailwind CSS v4 + shadcn/ui components
- SWR for client-side data fetching

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- MongoDB (either local installation or MongoDB Atlas cloud database)

## 1) Install dependencies

\`\`\`bash
npm install

# or

pnpm install

# or

yarn
\`\`\`

## 2) Configure environment variables

Create a **.env.local** file at the project root with the following content:

\`\`\`bash

# MongoDB Configuration

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=highway_delight_db

# JWT Configuration

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (optional)

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Next.js Configuration

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
\`\`\`

**Important**: Replace `your-super-secret-jwt-key-change-this-in-production` with a secure random string. You can generate one using:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## 3) Setup Database (Optional)

The database will be created automatically when you first run the application. However, you can run the setup script to verify your MongoDB connection:

```bash
npm run setup-db
```

## 4) Run the dev server

\`\`\`bash
npm run dev
\`\`\`
Open http://localhost:3000.

## 5) Build and run production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Notes

- Tailwind v4 is configured in `app/globals.css` using `@import 'tailwindcss'`. No tailwind.config.js is needed.
- If you see auth or DB errors, confirm `.env.local` is correct and that MongoDB is reachable.
- This project uses the Next.js App Router. API routes are under `app/api/*`. Pages are under `app/*`.

## Authentication Flow

This application implements a secure authentication flow:

1. **Signup**: Users must first create an account at `/signup`
2. **Login**: After signup, users are redirected to `/login` to authenticate
3. **JWT Tokens**: Upon successful login, a JWT token is stored as an httpOnly cookie
4. **Session Management**: The token persists across browser sessions until logout
5. **Logout**: Clicking logout clears the cookie and redirects to login

## Database Configuration

- **Automatic Database Creation**: The database and collections are created automatically when the application starts
- **Database Name**: Defaults to `highway_delight_db` (configurable via `MONGODB_DB` environment variable)
- **Collections**: `users` and `notes` collections are created automatically with proper indexes
- **Connection**: You can optionally provide `MONGODB_DB` in your `.env.local`. If present, the app will connect to `${MONGODB_URI}/${MONGODB_DB}`.
- **Atlas Setup**: To create a new database in Atlas: create a cluster, add a database user with a password, and use the connection string (without the db name) as `MONGODB_URI`. Then set `MONGODB_DB` to the desired database name.
- **Local Development**: When running locally, visit `/signup` to create a new user and `/login` to authenticate. Successful sign-in sets an httpOnly cookie called `token` for server-side auth.

## User Data Isolation

- Each user's notes are stored with their user ID in the database
- Notes are automatically filtered by the authenticated user
- Users can only access their own notes
