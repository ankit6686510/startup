# Authentication & User Management Setup

This document outlines the authentication and user management features built into the StartupCompass frontend.

## Features Implemented

### 1. **Authentication Pages**
- **Login Page** (`/auth/login`) - Email and password login with OAuth options
- **Register Page** (`/auth/register`) - User registration with form validation
- **Forgot Password** (`/auth/forgot-password`) - Request password reset
- **Reset Password** (`/auth/reset-password?token=...`) - Set new password with token validation

### 2. **User Profile**
- **Profile Page** (`/profile`) - View and edit user information
- Profile form with validation
- Support for profile picture display
- Membership information

### 3. **Onboarding Wizard**
- **3-Step Onboarding** (`/onboarding`)
  - Step 1: Welcome introduction
  - Step 2: Select interests (industries, job categories, locations)
  - Step 3: Notification preferences

### 4. **OAuth Integration**
- GitHub OAuth
- Google OAuth
- LinkedIn OAuth

Each provider can be configured in the `.env.local` file.

## Setup Instructions

### 1. Environment Configuration

Copy the environment template and update with your values:

```bash
cp .env.example .env.local
```

Then fill in:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (default: `http://localhost:3000/api/v1`)
- OAuth client IDs and redirect URIs for GitHub, Google, and LinkedIn

### 2. OAuth Setup

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/auth/oauth/github/callback`
4. Copy Client ID and Client Secret
5. Add to `.env.local`:
```
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/oauth/github/callback
```

#### Google OAuth
1. Go to Google Cloud Console
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/auth/oauth/google/callback`
6. Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/oauth/google/callback
```

#### LinkedIn OAuth
1. Go to LinkedIn Developers
2. Create a new app
3. Add authorized redirect URL: `http://localhost:3000/auth/oauth/linkedin/callback`
4. Copy Client ID and Client Secret
5. Add to `.env.local`:
```
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/oauth/linkedin/callback
```

### 3. Backend API Requirements

The frontend expects the following API endpoints from your backend:

#### Authentication Endpoints
- `POST /auth/login` - Login with email and password
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `POST /auth/password-reset/request` - Request password reset
- `POST /auth/password-reset/confirm` - Reset password with token
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user
- `PATCH /auth/profile` - Update user profile

#### OAuth Endpoints
- `GET /auth/oauth/{provider}/authorize` - Get OAuth authorization URL
- `POST /auth/oauth/{provider}/callback` - Handle OAuth callback

### 4. File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── components/
│   │   │   │   └── OAuthButtons.tsx
│   │   │   └── layout.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── ProfileForm.tsx
│   │   └── onboarding/
│   │       ├── page.tsx
│   │       └── components/
│   │           ├── OnboardingStep1.tsx
│   │           ├── OnboardingStep2.tsx
│   │           └── OnboardingStep3.tsx
│   └── features/
│       └── auth/
│           ├── api.ts - API client
│           ├── store.ts - Zustand store
│           ├── hooks.ts - useAuth hook
│           └── types.ts - TypeScript types
└── .env.example
```

### 5. Usage

#### Using the `useAuth` Hook

```typescript
import { useAuth } from '@/features/auth/hooks';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

#### Protected Routes

Use the `useRequireAuth` hook to protect routes:

```typescript
import { useRequireAuth } from '@/features/auth/hooks';

export default function ProtectedPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <Loading />;
  }

  return <div>Protected content</div>;
}
```

## API Response Types

### User Type
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'STARTUP_FOUNDER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}
```

### UserPreferences Type
```typescript
interface UserPreferences {
  jobCategories: string[];
  industries: string[];
  locations: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}
```

## Token Management

- Tokens are stored in `localStorage`
- Access token is sent with every request in the `Authorization` header
- Refresh token is used to obtain new access tokens
- On logout, both tokens are removed from localStorage

## Next Steps

1. Set up your backend API endpoints
2. Configure OAuth applications
3. Update `.env.local` with your configuration
4. Create a dashboard page at `/dashboard`
5. Add additional user preferences pages
6. Implement email verification flow
7. Add two-factor authentication (optional)

## Customization

### Styling
The authentication pages use Tailwind CSS and can be customized by modifying the component files.

### Form Validation
Forms use React Hook Form with Zod for validation. Update schemas in the page components.

### Theme
The app supports light/dark mode using next-themes. Update the Providers component to customize theme settings.
