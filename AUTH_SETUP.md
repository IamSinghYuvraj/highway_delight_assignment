# Authentication Setup Guide

This project uses NextAuth.js for authentication with both credentials (email/password) and Google OAuth.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users if needed

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 4. Authorized JavaScript Origins

Add these to your OAuth 2.0 client configuration:

- `http://localhost:3000` (for development)
- `https://yourdomain.com` (for production)

## API Routes

### Signup (Credentials)

- **POST** `/api/auth/signup`
- **Body**: `{ "email": "user@example.com", "password": "password", "name": "User Name" }`

### Authentication (NextAuth)

- **GET** `/api/auth/signin` - Sign in page
- **POST** `/api/auth/signin` - Sign in with credentials
- **GET** `/api/auth/signout` - Sign out
- **GET** `/api/auth/session` - Get current session
- **GET** `/api/auth/callback/google` - Google OAuth callback

## Usage

### Client-side Authentication

```typescript
import { signIn, signOut, useSession } from "next-auth/react";

// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: false,
});

// Sign in with Google
await signIn("google", { redirect: false });

// Sign out
await signOut();

// Get session
const { data: session } = useSession();
```

### Server-side Authentication

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  // User not authenticated
}
```

## Security Notes

1. **NEXTAUTH_SECRET**: Generate a strong random string for production
2. **MONGODB_URI**: Use a secure connection string
3. **Environment**: Never commit `.env.local` to version control
4. **HTTPS**: Use HTTPS in production for secure OAuth flows

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure your redirect URIs match exactly in Google Console
2. **"Client ID not found"**: Verify your environment variables are loaded correctly
3. **"Database connection failed"**: Check your MongoDB connection string
4. **"Session not working"**: Ensure NEXTAUTH_SECRET is set and consistent

### Development vs Production

- **Development**: Use `http://localhost:3000` for all URLs
- **Production**: Use your actual domain with HTTPS
- **Environment Variables**: Use different values for dev/prod environments
