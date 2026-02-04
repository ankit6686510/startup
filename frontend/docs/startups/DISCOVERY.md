# Startups Discovery Feature Documentation

## Overview

The Startups Discovery feature is the core browsing and discovery engine for StartupCompass. It allows users to:
- Browse and search all startups in the platform
- Filter by 8 different criteria (industry, funding stage, location, etc.)
- View detailed startup profiles with team, funding, jobs, and news
- Compare multiple startups side-by-side
- Save/follow startups for later

## Directory Structure

```
src/features/startups/
├── components/
│   ├── StartupFilters.tsx          # Advanced filtering UI
│   ├── StartupSearch.tsx           # Search with autocomplete
│   ├── StartupCardComponent.tsx    # Card display (grid/list)
│   ├── StartupComparison.tsx       # Comparison table
│   ├── TeamSection.tsx             # Team members display
│   └── NewsTimeline.tsx            # News & updates feed
├── api.ts                          # API client (13 methods)
├── hooks.ts                        # React Query hooks (14 hooks)
└── types.ts                        # TypeScript interfaces (16 types)

src/app/startups/
├── page.tsx                        # Browse/search page
├── [id]/
│   └── page.tsx                    # Startup profile page
└── compare/
    ├── page.tsx                    # Comparison tool
    └── [ids]/
        └── page.tsx                # Comparison results
```

## Key Features

### 1. **Startup Discovery (Browse Page)**
- **Route**: `/startups`
- **Grid/List View Toggle**: Switch between card grid and list layouts
- **Real-time Search**: Search across startup names, descriptions
- **Advanced Filters**: Filter by 8 dimensions with active filter count
- **Pagination**: Browse through results with page navigation
- **Mobile Responsive**: Collapsible filter drawer on mobile

#### Filters (8 Dimensions)
1. **Industries** - 12 categories (Tech, Healthcare, Finance, etc.)
2. **Funding Stages** - 10 stages (IDEA through PUBLIC)
3. **Funding Amount** - Min/max range input
4. **Locations** - 12 major cities
5. **Status** - ACTIVE, ACQUIRED, CLOSED, PIVOT
6. **Employee Count** - 6 ranges (1-10 to 1000+)
7. **Sort Options** - Newest, Most funded, Most followed
8. **Search Query** - Full-text search

### 2. **Startup Profiles**
- **Route**: `/startups/:id`
- **Tabbed Interface**:
  - **Overview**: Description, funding history, key metrics
  - **Team**: Founder and team member profiles with LinkedIn links
  - **Jobs**: Open positions at the startup
  - **News**: Recent news articles and press mentions
- **Follow/Save**: Users can follow startups and add to watchlist
- **Back Navigation**: Easy return to discovery page

### 3. **Startup Comparison Tool**
- **Route**: `/startups/compare`
- **Selection**: Choose 2-4 startups to compare
- **Comparison View**: `/startups/compare/id1,id2,id3`
- **Metrics Displayed**:
  - Funding stage
  - Total funded amount
  - Founded year
  - Location
  - Industry
  - Followers count
  - Employee count
  - Status

### 4. **Search & Autocomplete**
- **Real-time Search**: As users type, suggestions appear
- **Result Preview**: Logo, name, location, industry for each result
- **Auto-complete**: Powered by React Query with caching

## Data Models

### Core Startup Object

```typescript
interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
  founded: string; // ISO date
  fundingStage: FundingStage;
  totalFunded: number;
  industry: string;
  location: {
    city: string;
    country: string;
  };
  employeeCount: number;
  status: StartupStatus;
  followersCount: number;
  isFollowing: boolean;
  isSaved: boolean;
}
```

### Extended Startup (Detail Page)

```typescript
interface StartupDetail extends Startup {
  team: Founder[];
  fundingHistory: FundingRound[];
  jobs: StartupJob[];
  news: StartupNews[];
}
```

### Helper Types

- **Founder**: Team member with bio, role, image, LinkedIn
- **FundingRound**: Funding event with stage, amount, date, investors
- **StartupJob**: Job listing with title, location, type
- **StartupNews**: News article with title, summary, source, category

## API Endpoints

All endpoints in `StartupsAPI` class:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getStartups()` | GET `/api/startups` | List with pagination/filters |
| `getStartupById()` | GET `/api/startups/:id` | Single startup detail |
| `searchStartups()` | GET `/api/startups/search` | Autocomplete search |
| `getTrendingStartups()` | GET `/api/startups/trending` | Trending list |
| `getStartupsByIndustry()` | GET `/api/startups/industry/:id` | Filter by industry |
| `getIndustryStats()` | GET `/api/startups/stats/industries` | Industry analytics |
| `compareStartups()` | POST `/api/startups/compare` | Comparison data |
| `getStartupJobs()` | GET `/api/startups/:id/jobs` | Related jobs |
| `getStartupNews()` | GET `/api/startups/:id/news` | Related news |
| `getRelatedStartups()` | GET `/api/startups/:id/related` | Similar startups |
| `toggleFollowStartup()` | POST `/api/startups/:id/follow` | Follow/unfollow |
| `toggleSaveStartup()` | POST `/api/startups/:id/save` | Save/unsave |
| `getSavedStartups()` | GET `/api/startups/saved` | User's saved list |
| `getSuggestedStartups()` | GET `/api/startups/suggested` | Recommendations |

## React Query Hooks

### Query Hooks (Read-Only)

```typescript
// List with pagination & filters
const { data, isLoading, error } = useStartups({ 
  page: 1,
  pageSize: 12,
  filters: { /* ... */ }
});

// Single startup detail
const { data: startup } = useStartupDetail(id);

// Search autocomplete
const { data: results } = useStartupSearch(query);

// Trending startups
const { data: trending } = useTrendingStartups();

// By industry
const { data: byIndustry } = useStartupsByIndustry(industry);

// Industry statistics
const { data: stats } = useIndustryStats();

// Related jobs/news/startups
const { data: jobs } = useStartupJobs(startupId);
const { data: news } = useStartupNews(startupId);
const { data: related } = useRelatedStartups(startupId);
```

### Mutation Hooks (Write Operations)

```typescript
// Follow a startup
const { mutate: toggleFollow } = useToggleFollowStartup();
toggleFollow({ startupId: '123', follow: true });

// Save a startup
const { mutate: toggleSave } = useToggleSaveStartup();
toggleSave({ startupId: '123', save: true });
```

### Cache Configuration

Different hooks have different cache lifetimes optimized for use:
- **Short cache (5 min)**: Search, trending, jobs, news
- **Medium cache (10 min)**: List, detail, saved startups
- **Long cache (60 min)**: Industry stats, suggestions

## Component Usage

### StartupCard Component

```tsx
import { StartupCard } from '@/features/startups/components/StartupCardComponent';

// Grid variant (default)
<StartupCard startup={startup} />

// List variant
<StartupCard startup={startup} variant="list" />

// With skeleton loader
<StartupCardSkeleton variant="grid" />
```

### StartupFilters Component

```tsx
import { StartupFilters } from '@/features/startups/components/StartupFilters';

const [filters, setFilters] = useState({
  industries: [],
  fundingStages: [],
  // ...
});

<StartupFilters onChange={setFilters} />
```

### TeamSection Component

```tsx
import { TeamSection } from '@/features/startups/components/TeamSection';

<TeamSection team={startup.team} isLoading={isLoading} />
```

### NewsTimeline Component

```tsx
import { NewsTimeline } from '@/features/startups/components/NewsTimeline';

<NewsTimeline news={startup.news} isLoading={isLoading} />
```

## Integration with Navigation

### Adding to Sidebar

Update `/src/components/Sidebar.tsx`:

```tsx
<Link href="/startups" className="...">
  🚀 Discover Startups
</Link>
```

### Adding to Header

Update `/src/components/Header.tsx`:

```tsx
<nav>
  <Link href="/startups">Browse</Link>
  <Link href="/startups/compare">Compare</Link>
</nav>
```

## Search & Filter Optimization

1. **Debounced Search**: Implemented in `StartupSearch.tsx` with 300ms debounce
2. **Query Key Management**: `queryKeys.startups` factory prevents data inconsistencies
3. **Query Invalidation**: Auto-invalidation on follow/save mutations
4. **Pagination**: Efficient cursor-based or offset-based pagination
5. **Filtering**: All filters combined into single API request

## Error Handling

- **Network Errors**: Toast notification with retry option
- **Not Found**: Redirect to 404-like error page
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful messages and clear filters option

## Performance Considerations

1. **Image Optimization**: Use Next.js `Image` component for logos
2. **Lazy Loading**: Startups loaded on scroll/pagination
3. **Memoization**: Components wrapped with `React.memo` where appropriate
4. **Code Splitting**: Each page route lazy-loaded automatically by Next.js
5. **Stale-While-Revalidate**: React Query set to revalidate data in background

## Accessibility

- **Keyboard Navigation**: All buttons and links keyboard accessible
- **ARIA Labels**: Proper labels for filters and buttons
- **Color Contrast**: Text meets WCAG AA standards
- **Focus Indicators**: Visible focus states on all interactive elements
- **Alt Text**: All images have descriptive alt text

## Testing Recommendations

1. **Unit Tests**: Test API methods, hooks, type validation
2. **Component Tests**: Test filters, search, card rendering
3. **Integration Tests**: Test filter + search together, pagination
4. **E2E Tests**: Browse page flow, profile view, comparison flow

## Future Enhancements

1. **Saved Filters**: Let users save and reuse filter combinations
2. **Notifications**: Alert users when followed startups get funding
3. **Startup Dashboard**: Analytics for startup founders
4. **Export Data**: Download comparison as PDF
5. **Advanced Analytics**: Industry trends, growth metrics
6. **Watchlist**: More features on saved startups page
