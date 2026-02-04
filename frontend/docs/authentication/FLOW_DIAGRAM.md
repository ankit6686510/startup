# Authentication Flow Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    StartupCompass Auth Flow                     │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │  Home Page   │
                         └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────▼─────┐           ┌────▼──────┐
              │   Login   │           │  Register │
              └─────┬─────┘           └────┬──────┘
                    │                      │
        ┌───────────┼──────────────────────┼──────────┐
        │           │                      │          │
   ┌────▼────┐ ┌───▼────┐ ┌──────────┐ ┌──▼─────┐     │
   │Email    │ │GitHub  │ │ Google   │ │LinkedIn│     │
   │Password │ │OAuth   │ │ OAuth    │ │OAuth   │     │
   └────┬────┘ └───┬────┘ └──────┬───┘ └──┬─────┘     │ 
        │          │             │        │           │
        └──────────┼─────────────┼────────┘           │
                   │             │                 ___|
              ┌────▼─────────────▼────┐           │
              │   Auth API Server     │           │
              │   - Validate          │           │
              │   - Generate Tokens   │           │
              └────┬──────────────────┘           │
                   │                              │
              ┌────▼──────────────────┐           │
              │ Success Response      │           │
              │ - User Data           │◄──────────┘
              │ - Access Token        │
              │ - Refresh Token       │
              └────┬──────────────────┘
                   │
         ┌─────────▼──────────┐
         │  Onboarding Flow   │
         │  1. Welcome        │
         │  2. Interests      │
         │  3. Preferences    │
         └─────────┬──────────┘
                   │
            ┌──────▼────────┐
            │   Dashboard   │
            │   (Protected) │
            └──────────────┘
```

## Page Routes Map

```
/                          (Home Page)
│
├── /auth/login             (Email/Password + OAuth)
│   └── (Success) → /onboarding
│
├── /auth/register          (Registration Form)
│   └── (Success) → /onboarding
│
├── /auth/forgot-password   (Email Input)
│   └── (Email Sent) → Check Email
│
├── /auth/reset-password    (Reset with Token)
│   └── (Success) → /auth/login
│
├── /onboarding             (Protected - 3 Steps)
│   ├── Step 1: Welcome
│   ├── Step 2: Interests
│   ├── Step 3: Preferences
│   └── (Complete) → /dashboard
│
├── /dashboard              (Protected - Main App)
│   ├── /startups           (Browse Startups)
│   ├── /jobs               (Job Board)
│   ├── /funding            (Funding Tracker)
│   ├── /news               (Latest News)
│   └── /profile            (User Profile)
│
└── /profile                (Protected - Profile Settings)
    ├── View Info
    └── Edit Profile
```

## Authentication States

```
┌─────────────────────────────────┐
│    Initial State (No Token)     │
│  user: null                     │
│  isAuthenticated: false         │
│  isLoading: false               │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │   Logging   │
        │   In        │
        └──────┬──────┘
               │
     ┌─────────▼─────────┐
     │  Authenticated    │
     │  user: User       │
     │  isAuth: true     │
     │  tokens: stored   │
     └─────────┬─────────┘
               │
        ┌──────▼───────┐
        │  Logging     │
        │  Out         │
        └──────┬───────┘
               │
    ┌──────────▼──────────┐
    │  Unauthenticated    │
    │ (redirect to login) │
    └─────────────────────┘
```

## API Call Flow

```
User Action (Login/Register)
        │
        ▼
React Component
        │
        ▼
useAuth Hook
        │
        ├─ setLoading(true)
        │
        ▼
authAPI.login(credentials)
        │
        ├─ Axios POST to /auth/login
        │
        ▼
Backend Processing
        │
        ├─ Validate credentials
        ├─ Hash password check
        ├─ Generate JWT tokens
        │
        ▼
Response {user, accessToken, refreshToken}
        │
        ├─ authAPI intercepts response
        ├─ Store tokens in localStorage
        │
        ▼
useAuth Updates State
        │
        ├─ setUser(user)
        ├─ setLoading(false)
        │
        ▼
Component Re-renders
        │
        ▼
Router Redirects to /onboarding or /dashboard
```

## Token Management

```
┌─────────────────────────────────────┐
│   Access Token (Short-lived)        │
│   - Sent with every API request     │
│   - Expires in 15 minutes (typical) │
│   - Stored in localStorage          │
└──────────────┬──────────────────────┘
               │
        ┌──────▼──────┐
        │   Expired?  │
        └──────┬──────┘
               │
        ┌──────▼──────────────┐
        │ Use Refresh Token   │
        │ to get new Access   │
        └──────┬──────────────┘
               │
        ┌──────▼──────────────────────┐
        │ Retry Original Request      │
        │ with new Access Token       │
        └─────────────────────────────┘

┌────────────────────────────────────┐
│  Refresh Token (Long-lived)        │
│  - Used to get new Access Token    │
│  - Expires in 7 days (typical)     │
│  - Stored in localStorage          │
│  - Sent to refresh endpoint only   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  On Logout                         │
│  - Clear localStorage              │
│  - Call /auth/logout endpoint      │
│  - Set user to null                │
│  - Redirect to /auth/login         │
└────────────────────────────────────┘
```

## Onboarding Flow

```
New User Created
       │
       ▼
/onboarding?step=1
       │
       ├─ Check: onboardingCompleted?
       │  ├─ Yes → Redirect to /dashboard
       │  └─ No → Show Step 1
       │
       ▼
Step 1: Welcome
       │
       ├─ Display features
       ├─ Collect: Nothing
       └─ "Get Started" → Next
       │
       ▼
Step 2: Interests
       │
       ├─ Multi-select industries
       ├─ Multi-select job categories
       ├─ Multi-select locations
       ├─ Store in state
       └─ "Next" → Continue
       │
       ▼
Step 3: Preferences
       │
       ├─ Show selected interests
       ├─ Email notifications toggle
       ├─ Push notifications toggle
       ├─ Collect: Notification prefs
       └─ "Get Started!" → Complete
       │
       ▼
Complete Onboarding
       │
       ├─ Call API to save preferences
       ├─ Mark onboardingCompleted: true
       └─ Redirect to /dashboard
```

## Component Hierarchy

```
App
├── Layout (Providers)
│   ├── AuthProvider
│   ├── QueryClientProvider
│   ├── ThemeProvider
│   └── Toaster
│
└── Routes
    ├── /auth/*
    │   ├── LoginPage
    │   │   └── OAuthButtons
    │   ├── RegisterPage
    │   │   └── OAuthButtons
    │   ├── ForgotPasswordPage
    │   └── ResetPasswordPage
    │
    ├── /onboarding
    │   ├── OnboardingStep1
    │   ├── OnboardingStep2
    │   └── OnboardingStep3
    │
    ├── /dashboard
    │   └── Uses useRequireAuth()
    │
    ├── /profile
    │   ├── Uses useRequireAuth()
    │   └── ProfileForm
    │
    └── Protected App Routes
        └── Wrapped with useRequireAuth()
```

---

This flow ensures:
- ✅ Secure authentication
- ✅ Proper token management
- ✅ User guidance through onboarding
- ✅ Protected routes
- ✅ Smooth transitions between pages
