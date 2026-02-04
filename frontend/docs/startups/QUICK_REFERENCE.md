# Startups Discovery - Quick Reference

## 🗺️ Routes

```
/startups                    Browse all startups
/startups/:id                Startup profile
/startups/compare            Compare tool selector
/startups/compare/:ids       Comparison results
```

---

## 📦 Imports

```tsx
// Types
import { Startup, StartupDetail, Founder } from '@/features/startups';
import { FundingStage, StartupStatus } from '@/features/startups';

// Hooks - Queries
import { 
  useStartups,
  useStartupDetail,
  useStartupSearch,
  useTrendingStartups,
  useStartupsByIndustry,
  useIndustryStats,
  useStartupJobs,
  useStartupNews,
  useRelatedStartups,
  useSavedStartups,
  useSuggestedStartups
} from '@/features/startups';

// Hooks - Mutations
import {
  useToggleFollowStartup,
  useToggleSaveStartup
} from '@/features/startups';

// API
import { StartupsAPI } from '@/features/startups';

// Components
import {
  StartupCard,
  StartupCardSkeleton,
  StartupFilters,
  StartupSearch,
  StartupComparison,
  TeamSection,
  NewsTimeline
} from '@/features/startups';
```

---

## 🎯 Common Patterns

### List Startups with Filters

```tsx
const { data, isLoading } = useStartups({
  page: 1,
  pageSize: 12,
  filters: {
    industries: ['Tech'],
    fundingStages: ['SERIES_A', 'SERIES_B'],
    fundingMin: 1000000,
    fundingMax: 50000000,
    locations: ['San Francisco'],
    statuses: ['ACTIVE'],
    employeeRanges: ['51-100']
  }
});

return (
  <div className="grid grid-cols-3 gap-4">
    {data?.items.map(startup => (
      <StartupCard key={startup.id} startup={startup} />
    ))}
  </div>
);
```

### Search with Autocomplete

```tsx
const { data: results, isLoading } = useStartupSearch('query');

return (
  <StartupSearch />
);
```

### Get Startup Detail

```tsx
const { data: startup, isLoading } = useStartupDetail(startupId);

return (
  <>
    <h1>{startup?.name}</h1>
    <TeamSection team={startup?.team || []} />
    <NewsTimeline news={startup?.news || []} />
  </>
);
```

### Follow a Startup

```tsx
const { mutate: toggleFollow } = useToggleFollowStartup();

<button onClick={() => toggleFollow({
  startupId: 'id',
  follow: true
})}>
  Follow
</button>
```

### Save a Startup

```tsx
const { mutate: toggleSave } = useToggleSaveStartup();

<button onClick={() => toggleSave({
  startupId: 'id',
  save: true
})}>
  Save
</button>
```

### Compare Startups

```tsx
const api = StartupsAPI.getInstance();
const comparison = await api.compareStartups(['id1', 'id2', 'id3']);

return <StartupComparison startups={comparison} />;
```

---

## 🧵 Filter Options

### Industries (12)
- Tech
- Healthcare
- Finance
- E-commerce
- Education
- SaaS
- AI/ML
- Logistics
- Food & Beverage
- Real Estate
- Energy
- Gaming

### Funding Stages (10)
- IDEA
- SEED
- SERIES_A
- SERIES_B
- SERIES_C
- SERIES_D
- SERIES_E
- GROWTH
- LATE_STAGE
- PUBLIC

### Statuses (4)
- ACTIVE
- ACQUIRED
- CLOSED
- PIVOT

### Employee Ranges (6)
- 1-10
- 11-50
- 51-100
- 101-500
- 501-1000
- 1000+

### Locations (12)
- San Francisco
- New York
- London
- Berlin
- Tokyo
- Singapore
- Toronto
- Sydney
- Mumbai
- Hong Kong
- Los Angeles
- Chicago

---

## 🎨 Component Props

### StartupCard

```tsx
<StartupCard 
  startup={Startup}
  variant="grid" | "list"  // Default: 'grid'
/>

<StartupCardSkeleton variant="grid" | "list" />
```

### StartupFilters

```tsx
<StartupFilters 
  onChange={(filters: Filters) => {}} 
/>
```

### TeamSection

```tsx
<TeamSection 
  team={Founder[]}
  isLoading={boolean}
/>
```

### NewsTimeline

```tsx
<NewsTimeline 
  news={StartupNews[]}
  isLoading={boolean}
/>
```

### StartupComparison

```tsx
<StartupComparison 
  startups={Startup[]}
  isLoading={boolean}
/>
```

---

## 📊 API Methods

### Query Methods

```typescript
// List with pagination & filters
const result = await api.getStartups({
  page: number,
  pageSize: number,
  filters: StartupFilters
});

// Single startup
const startup = await api.getStartupById(id: string);

// Search autocomplete
const results = await api.searchStartups(query: string, limit?: number);

// Trending startups
const trending = await api.getTrendingStartups(limit?: number, timeframe?: string);

// By industry
const byIndustry = await api.getStartupsByIndustry(industry: string, limit?: number);

// Industry stats
const stats = await api.getIndustryStats();

// Related data
const jobs = await api.getStartupJobs(startupId: string);
const news = await api.getStartupNews(startupId: string, limit?: number);
const related = await api.getRelatedStartups(startupId: string, limit?: number);

// User data
const saved = await api.getSavedStartups(page?: number, pageSize?: number);
const suggested = await api.getSuggestedStartups(limit?: number);
```

### Mutation Methods

```typescript
// Comparison
const comparison = await api.compareStartups(ids: string[]);

// Follow/Unfollow
await api.toggleFollowStartup(startupId: string, follow: boolean);

// Save/Unsave
await api.toggleSaveStartup(startupId: string, save: boolean);
```

---

## 🔄 Query Keys

```typescript
// For reference in query invalidation
queryKeys.startups = ['startups'];
queryKeys.startupList = (page, filters) => ['startups', 'list', page, filters];
queryKeys.startupDetail = (id) => ['startups', 'detail', id];
queryKeys.startupSearch = (query) => ['startups', 'search', query];
queryKeys.trending = ['startups', 'trending'];
queryKeys.byIndustry = (industry) => ['startups', 'industry', industry];
queryKeys.industryStats = ['startups', 'stats', 'industries'];
queryKeys.startupJobs = (id) => ['startups', id, 'jobs'];
queryKeys.startupNews = (id) => ['startups', id, 'news'];
queryKeys.relatedStartups = (id) => ['startups', id, 'related'];
queryKeys.saved = ['startups', 'saved'];
queryKeys.suggested = ['startups', 'suggested'];
```

---

## ⚡ Hook Hook Signatures

```typescript
// Query Hooks
useStartups(options: {
  page: number;
  pageSize: number;
  filters: StartupFilters;
}) => UseQueryResult<PaginatedResponse<Startup>>;

useStartupDetail(id: string) => UseQueryResult<StartupDetail>;

useStartupSearch(query: string) => UseQueryResult<SearchResult[]>;

useTrendingStartups(limit?: number, timeframe?: string) => UseQueryResult<Startup[]>;

useStartupsByIndustry(industry: string, limit?: number) => UseQueryResult<Startup[]>;

useIndustryStats() => UseQueryResult<IndustryStats[]>;

useStartupJobs(startupId: string) => UseQueryResult<StartupJob[]>;

useStartupNews(startupId: string, limit?: number) => UseQueryResult<StartupNews[]>;

useRelatedStartups(startupId: string, limit?: number) => UseQueryResult<Startup[]>;

useSavedStartups(page?: number, pageSize?: number) => UseQueryResult<PaginatedResponse<Startup>>;

useSuggestedStartups(limit?: number) => UseQueryResult<Startup[]>;

// Mutation Hooks
useToggleFollowStartup() => UseMutationResult<any, Error, {
  startupId: string;
  follow: boolean;
}>;

useToggleSaveStartup() => UseMutationResult<any, Error, {
  startupId: string;
  save: boolean;
}>;
```

---

## 📋 TypeScript Interfaces

### Core

```typescript
interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
  founded: string;
  fundingStage: FundingStage;
  totalFunded: number;
  industry: string;
  location: { city: string; country: string };
  employeeCount: number;
  status: StartupStatus;
  followersCount: number;
  isFollowing: boolean;
  isSaved: boolean;
}

interface StartupDetail extends Startup {
  team: Founder[];
  fundingHistory: FundingRound[];
  jobs: StartupJob[];
  news: StartupNews[];
}
```

### Supporting

```typescript
interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedIn: string;
}

interface FundingRound {
  stage: string;
  amount: number;
  date: string;
  investors: string[];
}

interface StartupJob {
  id: string;
  title: string;
  location: string;
  type: string;
}

interface StartupNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  image: string;
}
```

---

## 🚨 Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_FILTER | 400 | Bad filter parameter |
| INVALID_ID_COUNT | 400 | Wrong number of IDs |
| NOT_FOUND | 404 | Startup not found |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Access denied |
| SERVER_ERROR | 500 | Backend error |

---

## 🎯 Cache Times

| Hook | Stale | Cache | Use Case |
|------|-------|-------|----------|
| useStartups | 5m | 10m | List page |
| useStartupDetail | 10m | 30m | Profile page |
| useStartupSearch | 5m | 10m | Search dropdown |
| useTrendingStartups | 30m | 60m | Homepage |
| useStartupsByIndustry | 10m | 30m | Category view |
| useIndustryStats | 60m | 2hr | Stats page |
| useStartupJobs | 5m | 10m | Profile tab |
| useStartupNews | 10m | 30m | Profile tab |
| useRelatedStartups | 10m | 30m | Profile section |

---

## 🔐 Authentication

```tsx
// Token automatically injected via axios interceptor
// No extra headers needed

// From Zustand auth store
const token = useAuthStore((state) => state.token);

// API client handles auth:
const api = StartupsAPI.getInstance();
// Token is automatically added to requests
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind breakpoints used */
sm: 640px    /* Mobile collapse */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
```

---

## 🧪 Testing Template

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

test('loads and displays startups', async () => {
  renderWithProviders(<StartupsPage />);
  
  await waitFor(() => {
    expect(screen.getByText(/TechCorp/i)).toBeInTheDocument();
  });
});
```

---

## 📚 Learn More

- Feature Overview: See `STARTUPS_DISCOVERY.md`
- Implementation: See `STARTUPS_IMPLEMENTATION.md`
- API Spec: See `STARTUPS_API_SPEC.md`
- Examples: See `STARTUPS_EXAMPLES.md`
- Full Guide: See `README_STARTUPS_DISCOVERY.md`

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
