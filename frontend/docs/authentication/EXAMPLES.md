# Authentication Code Examples & Quick Reference

## Using the `useAuth` Hook

### Basic Usage
```typescript
import { useAuth } from '@/features/auth/hooks';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Login Example
```typescript
'use client';

import { useAuth } from '@/features/auth/hooks';

export function LoginForm() {
  const { login, isLoginLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      email: 'user@example.com',
      password: 'password123'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button disabled={isLoginLoading} type="submit">
        {isLoginLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Route Example
```typescript
'use client';

import { useRequireAuth } from '@/features/auth/hooks';
import { Loading } from '@/components/ui/loading';

export default function ProtectedPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <Loading />;
  }

  // Component will only render if user is authenticated
  return <div>This content is protected</div>;
}
```

## Environment Configuration

### `.env.local` Template
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/oauth/github/callback

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/oauth/google/callback

# LinkedIn OAuth
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/oauth/linkedin/callback
```

## API Responses

### Login Response
```typescript
POST /auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "onboardingCompleted": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Register Response
```typescript
POST /auth/register
Request:
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "user": {
    "id": "124",
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "onboardingCompleted": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Current User Response
```typescript
GET /auth/me
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "id": "123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "onboardingCompleted": true,
  "preferences": {
    "jobCategories": ["Engineering", "Product Management"],
    "industries": ["Technology", "AI/ML"],
    "locations": ["San Francisco", "New York"],
    "emailNotifications": true,
    "pushNotifications": true
  }
}
```

## Creating Protected Components

### Page Component
```typescript
'use client';

import { useRequireAuth } from '@/features/auth/hooks';
import { Loading } from '@/components/ui/loading';

export default function ProfilePage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container">
      <h1>Profile Page</h1>
      {/* Your protected content here */}
    </div>
  );
}
```

### Component with User Data
```typescript
'use client';

import { useAuth } from '@/features/auth/hooks';

export function UserGreeting() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="greeting">
      <h1>Welcome, {user.firstName} {user.lastName}!</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

## Handling Async Auth Operations

### Using Toast Notifications
```typescript
import { useAuth } from '@/features/auth/hooks';
import toast from 'react-hot-toast';

export function LoginForm() {
  const { login } = useAuth();

  const handleLogin = (email: string, password: string) => {
    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Login successful!');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Login failed');
        }
      }
    );
  };

  return (
    <form onSubmit={() => handleLogin('user@example.com', 'password')}>
      {/* Form content */}
    </form>
  );
}
```

## Type Definitions Reference

```typescript
// User Type
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

// User Preferences
interface UserPreferences {
  jobCategories: string[];
  industries: string[];
  locations: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Auth Response
interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Login Credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Register Credentials
interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}
```

## Advanced Usage

### Checking Auth Status Before Rendering
```typescript
'use client';

import { useAuth } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return <div>Admin Content</div>;
}
```

### Custom Auth Hook
```typescript
import { useAuth } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuthenticatedUser() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const redirectIfNotAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  const hasRole = useCallback(
    (role: string) => user?.role === role,
    [user]
  );

  return {
    user,
    isAuthenticated,
    redirectIfNotAuth,
    hasRole,
    isAdmin: user?.role === 'ADMIN'
  };
}
```

## Common Patterns

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Loading State Management
```typescript
export function LoginForm() {
  const { login, isLoginLoading } = useAuth();

  return (
    <form>
      <button 
        disabled={isLoginLoading}
        type="submit"
      >
        {isLoginLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Error Handling
```typescript
export function LoginForm() {
  const { login, error } = useAuth();

  return (
    <form>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Debugging

### Enable Console Logging
Add to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

Then in your components:
```typescript
const { user, isAuthenticated } = useAuth();

useEffect(() => {
  if (process.env.NEXT_PUBLIC_DEBUG_AUTH) {
    console.log('Auth state:', { user, isAuthenticated });
  }
}, [user, isAuthenticated]);
```

### Check Token in DevTools
```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

---

For more information, see:
- AUTH_SETUP.md - Setup guide
- AUTH_FLOW_DIAGRAM.md - Visual flow diagrams
- AUTHENTICATION_BUILD_SUMMARY.md - Feature overview
