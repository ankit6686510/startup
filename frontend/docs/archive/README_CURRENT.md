# StartupCompass Frontend

A modern, responsive React frontend for the StartupCompass platform - your complete gateway to the startup ecosystem.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📋 Features Implemented

### ✅ Phase 1: Authentication & User Management
- **Login** - Email/password + OAuth (Google, GitHub, LinkedIn)
- **Registration** - New user signup with email verification
- **Password Recovery** - Forgot password + reset flow
- **User Profile** - View and edit user profile
- **Onboarding** - 3-step setup wizard (welcome, interests, preferences)
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Token Management** - Automatic JWT token refresh

### ✅ Phase 2: Dashboard
- **Stats Grid** - Key metrics dashboard (4 cards)
- **Activity Feed** - Recent user activities with badges
- **Trending Startups** - Popular startups with trend scores
- **Watchlist Summary** - Saved items with type breakdown
- **News Section** - Latest startup news and articles
- **Quick Links** - Navigation to other sections

### 🔄 Phases 3-6 (In Progress)
- Startups Directory (browse, search, detail pages)
- Job Board (listings, applications)
- Funding Tracker (opportunities, applications)
- News Section (aggregation, filters)

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── layout.tsx
│   │   ├── dashboard/            # Dashboard page
│   │   ├── profile/              # User profile page
│   │   ├── onboarding/           # Onboarding wizard
│   │   └── layout.tsx            # Root layout
│   │
│   ├── components/               # Reusable UI components
│   │   ├── ui/
│   │   │   ├── loading.tsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── types.ts          # Auth types
│   │   │   ├── api.ts            # API client
│   │   │   ├── store.ts          # Zustand store
│   │   │   ├── hooks.ts          # Custom hooks
│   │   │   └── components/
│   │   │
│   │   └── dashboard/
│   │       ├── types.ts          # Dashboard types
│   │       ├── api.ts            # API client
│   │       ├── hooks.ts          # React Query hooks
│   │       └── components/
│   │           ├── StatsGrid.tsx
│   │           ├── ActivityFeed.tsx
│   │           ├── TrendingStartups.tsx
│   │           ├── WatchlistSummary.tsx
│   │           └── DashboardNews.tsx
│   │
│   ├── hooks/                    # Global custom hooks
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Global styles
│   └── env.ts                    # Environment config
│
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── DASHBOARD_BUILD.md
│   ├── BACKEND_INTEGRATION.md
│   ├── DASHBOARD_LAYOUT.md
│   └── ...
│
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind CSS config
├── next.config.js                # Next.js config
├── package.json
└── README.md                     # This file
```

---

## 📚 Documentation

### Getting Started
- [START_HERE.md](docs/START_HERE.md) - Quick start guide
- [PROGRESS.md](PROGRESS.md) - Current build progress
- [ARCHITECTURE.md](docs/architecture.md) - System design

### Feature Documentation
- [AUTHENTICATION_BUILD_SUMMARY.md](docs/AUTHENTICATION_BUILD_SUMMARY.md) - Auth system overview
- [AUTH_SETUP.md](docs/AUTH_SETUP.md) - Authentication setup details
- [AUTH_CODE_EXAMPLES.md](docs/AUTH_CODE_EXAMPLES.md) - Auth code patterns
- [DASHBOARD_BUILD.md](docs/DASHBOARD_BUILD.md) - Dashboard feature details
- [DASHBOARD_LAYOUT.md](docs/DASHBOARD_LAYOUT.md) - Visual layout guide

### Integration
- [BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) - Backend API endpoints
- [IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) - Integration checklist

---

## 🛠️ Technology Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Radix UI

### State & Data
- **State Management**: Zustand
- **Server State**: TanStack React Query
- **HTTP Client**: Axios with interceptors
- **Form Validation**: React Hook Form + Zod

### Features
- **Notifications**: react-hot-toast
- **Theme**: next-themes (dark mode)
- **Icons**: Emoji + custom SVGs

### Development
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library
- **Build**: Next.js built-in

---

## 🔐 Authentication

### Supported Methods
1. **Email/Password**
   - Registration with email verification
   - Login with password
   - Password reset flow

2. **OAuth Providers**
   - Google
   - GitHub
   - LinkedIn

### Token Management
- JWT tokens with automatic refresh
- Secure token storage
- Automatic token injection in API requests
- Token expiration handling

### Protected Routes
```typescript
// Automatically redirects unauthenticated users to login
import { useRequireAuth } from '@/features/auth/hooks';

export default function ProtectedPage() {
  const { isLoading } = useRequireAuth();
  
  if (isLoading) return <Loading />;
  
  return <div>Protected content</div>;
}
```

---

## 📊 Dashboard Features

### Stats Grid
Displays key metrics:
- Startups Followed
- Jobs Saved
- Funding Opportunities
- Watchlist Items

### Activity Feed
Shows recent user activities:
- Startup followed
- Job saved
- Article read
- Funding update

### Trending Startups
Displays popular startups with:
- Trend score
- Follower count
- Funding information
- Links to detail pages

### Watchlist Summary
Shows saved items with:
- Type breakdown counts
- Recent items list
- Status indicators
- Quick access links

### News Section
Latest startup news with:
- Article images
- Category badges
- Publication dates
- External links

---

## 🔌 API Integration

The frontend is ready for backend API integration. All endpoints are documented in [BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md).

### Required Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user profile
- `POST /api/auth/logout` - User logout

#### Dashboard
- `GET /api/dashboard` - Full dashboard data
- `GET /api/dashboard/stats` - Stats only
- `GET /api/dashboard/activity` - Activity feed
- `GET /api/dashboard/trending` - Trending startups
- `GET /api/dashboard/watchlist` - Watchlist items
- `GET /api/dashboard/news` - News articles

### Example Usage

```typescript
import { useAuth } from '@/features/auth/hooks';
import { useDashboardStats } from '@/features/dashboard/hooks';

export default function MyComponent() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      {isLoading ? <Loading /> : <StatsGrid stats={stats} />}
    </div>
  );
}
```

---

## 📱 Responsive Design

The frontend is fully responsive across all devices:

### Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Mobile-First Approach
All styles start mobile and scale up using Tailwind breakpoints.

### Dark Mode
Dark mode is fully supported via `next-themes` integration.

---

## 🧪 Testing

### Run Tests
```bash
npm run test                 # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Test Structure
```
tests/
├── e2e/                    # End-to-end tests
│   └── startup-platform.e2e.test.ts
├── integration/            # Integration tests
│   ├── api-gateway.integration.test.ts
│   └── ...
├── unit/                   # Unit tests
│   └── ...
└── setup/                  # Test utilities
    └── ...
```

---

## 🚀 Deployment

### Production Build
```bash
npm run build              # Build Next.js app
npm start                  # Start production server
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_id
NEXT_PUBLIC_OAUTH_GITHUB_CLIENT_ID=your_github_id
NEXT_PUBLIC_OAUTH_LINKEDIN_CLIENT_ID=your_linkedin_id
```

### Docker
```bash
docker build -f Dockerfile -t startup-frontend .
docker run -p 3000:3000 startup-frontend
```

---

## 📈 Performance

### Optimizations
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Lazy loading for components
- Caching strategy with React Query
- CSS optimization with Tailwind

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Focus indicators visible

---

## 🔒 Security

### Best Practices Implemented
- JWT token-based authentication
- Secure token storage
- HTTPS enforced in production
- XSS protection via React escaping
- CSRF protection via SameSite cookies
- Content Security Policy headers
- Secure form handling with Zod validation

---

## 📞 Troubleshooting

### Issue: Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Issue: Types not found
```bash
npm run build                # Regenerates types
npm install                  # Reinstall dependencies
```

### Issue: Module not found
```bash
rm -rf node_modules
npm install
npm run dev
```

### Issue: API requests failing
1. Verify backend is running on correct port
2. Check API URL in `.env.local`
3. Check CORS configuration
4. Check network in DevTools

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Use Prettier formatting
- Write descriptive commit messages
- Add JSDoc comments for components

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For questions or issues:
1. Check the [documentation](docs/)
2. Review [GitHub issues](https://github.com/StartupCompass/frontend/issues)
3. Contact the development team

---

## 🗺️ Roadmap

### Q1 2024
- ✅ Authentication system
- ✅ Dashboard feature
- 🔄 Startups directory
- 🔄 Job board

### Q2 2024
- Funding tracker
- News aggregation
- User preferences
- Advanced filters

### Q3 2024
- Mobile app (React Native)
- PWA features
- Recommendations engine
- Analytics dashboard

### Q4 2024
- Browser extensions
- Email notifications
- Premium features
- API for partners

---

**Current Status**: Phase 2 Complete (Dashboard) ✅ | 33% of features implemented
**Last Updated**: 2024-01-15
**Next Focus**: Phase 3 - Startups Directory
