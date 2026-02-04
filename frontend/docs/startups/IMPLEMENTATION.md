# Startups Discovery - Implementation Guide

## Quick Start

### 1. Setting Up Routes

The feature uses Next.js App Router with the following routes:

```
/startups                    # Browse/search all startups
/startups/:id                # Startup profile page
/startups/compare            # Comparison tool selector
/startups/compare/:ids       # Comparison results
```

### 2. Using the Discovery Page

```tsx
import StartupsPage from '@/app/startups/page';

// User visits /startups and can:
// - Search in real-time
// - Apply filters (industries, funding, location, etc.)
// - Toggle between grid/list view
// - Navigate through paginated results
// - Click startup to view profile
```

### 3. Building a Startup Profile View

```tsx
'use client';

import { useStartupDetail } from '@/features/startups/hooks';
import { TeamSection } from '@/features/startups/components/TeamSection';
import { NewsTimeline } from '@/features/startups/components/NewsTimeline';

export default function MyStartupView({ startupId }: { startupId: string }) {
  const { data: startup, isLoading } = useStartupDetail(startupId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{startup?.name}</h1>
      <TeamSection team={startup?.team || []} />
      <NewsTimeline news={startup?.news || []} />
    </div>
  );
}
```

### 4. Implementing Custom Filters

```tsx
import { StartupFilters } from '@/features/startups/components/StartupFilters';

const [filters, setFilters] = useState({
  industries: ['Tech', 'AI/ML'],
  fundingStages: ['SERIES_A', 'SERIES_B'],
  fundingMin: '1000000',
  fundingMax: '50000000',
  locations: ['San Francisco', 'New York'],
  statuses: ['ACTIVE'],
  employeeRanges: ['51-100', '101-500'],
});

// Use in query
const { data } = useStartups({ 
  page: 1,
  pageSize: 12,
  filters 
});
```

### 5. Creating a Custom Startup List

```tsx
import { StartupCard } from '@/features/startups/components/StartupCardComponent';
import { useStartups } from '@/features/startups/hooks';

export function CustomStartupList() {
  const { data: startups, isLoading } = useStartups({
    page: 1,
    pageSize: 20,
    filters: {
      industries: ['Healthcare'],
      fundingStages: ['SEED', 'SERIES_A']
    }
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {startups?.items.map(startup => (
        <StartupCard 
          key={startup.id} 
          startup={startup} 
          variant="grid"
        />
      ))}
    </div>
  );
}
```

## API Integration Guide

### Backend Endpoints Required

Your backend must implement these endpoints:

#### GET /api/startups
List startups with pagination and filtering.

```typescript
// Query Parameters
{
  page: number;           // 1-indexed
  pageSize: number;       // Default: 12
  industries?: string[];  // Filter by industries
  fundingStages?: string[];
  fundingMin?: number;
  fundingMax?: number;
  locations?: string[];
  statuses?: string[];
  employeeRanges?: string[];
  sortBy?: 'newest' | 'most_funded' | 'most_followed';
  search?: string;
}

// Response
{
  items: Startup[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### GET /api/startups/:id
Get full startup details including team, funding, jobs, news.

```typescript
// Response
{
  ...Startup,
  team: Founder[];
  fundingHistory: FundingRound[];
  jobs: StartupJob[];
  news: StartupNews[];
}
```

#### GET /api/startups/search
Autocomplete search endpoint.

```typescript
// Query Parameters
{
  query: string;    // Search term
  limit?: number;   // Default: 5
}

// Response
{
  results: SearchResult[];
}

// SearchResult
{
  id: string;
  name: string;
  logo: string;
  tagline: string;
  location: { city: string; country: string };
  industry: string;
}
```

#### POST /api/startups/compare
Get comparison data for multiple startups.

```typescript
// Request Body
{
  ids: string[];  // 2-4 startup IDs
}

// Response
Startup[]
```

#### POST /api/startups/:id/follow
Follow/unfollow a startup.

```typescript
// Request Body
{
  follow: boolean;
}

// Response
{
  success: boolean;
  isFollowing: boolean;
}
```

#### POST /api/startups/:id/save
Save/unsave a startup.

```typescript
// Request Body
{
  save: boolean;
}

// Response
{
  success: boolean;
  isSaved: boolean;
}
```

### Other Endpoints

Additional endpoints in `StartupsAPI`:
- `GET /api/startups/trending` - Trending startups
- `GET /api/startups/industry/:industry` - By industry
- `GET /api/startups/stats/industries` - Industry analytics
- `GET /api/startups/:id/jobs` - Related jobs
- `GET /api/startups/:id/news` - Related news
- `GET /api/startups/:id/related` - Similar startups
- `GET /api/startups/saved` - User's saved startups
- `GET /api/startups/suggested` - Personalized suggestions

## Data Model Implementation

### TypeScript Interfaces

```typescript
// Enums
enum FundingStage {
  IDEA = 'IDEA',
  SEED = 'SEED',
  SERIES_A = 'SERIES_A',
  SERIES_B = 'SERIES_B',
  SERIES_C = 'SERIES_C',
  SERIES_D = 'SERIES_D',
  SERIES_E = 'SERIES_E',
  GROWTH = 'GROWTH',
  LATE_STAGE = 'LATE_STAGE',
  PUBLIC = 'PUBLIC',
}

enum StartupStatus {
  ACTIVE = 'ACTIVE',
  ACQUIRED = 'ACQUIRED',
  CLOSED = 'CLOSED',
  PIVOT = 'PIVOT',
}

// Core interfaces
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

## Customization Examples

### Custom Filter Component

```tsx
import { StartupFilters } from '@/features/startups/components/StartupFilters';

export function CustomFilters() {
  const [filters, setFilters] = useState({
    industries: [],
    fundingStages: [],
    fundingMin: '',
    fundingMax: '',
    locations: [],
    statuses: [],
    employeeRanges: [],
  });

  return (
    <div>
      <StartupFilters onChange={setFilters} />
      {/* Use filters to fetch data */}
    </div>
  );
}
```

### Custom Search Bar

```tsx
import { StartupSearch } from '@/features/startups/components/StartupSearch';

export function MySearchBar() {
  return (
    <div>
      <StartupSearch />
      {/* Handles search and selection internally */}
    </div>
  );
}
```

### Startup Gallery

```tsx
import { StartupCard } from '@/features/startups/components/StartupCardComponent';

export function StartupGallery({ startups }: { startups: Startup[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {startups.map(startup => (
        <StartupCard 
          key={startup.id} 
          startup={startup} 
          variant="grid"
        />
      ))}
    </div>
  );
}
```

## State Management

### Using React Query

```tsx
import { useStartups } from '@/features/startups/hooks';

function MyComponent() {
  const { data, isLoading, error } = useStartups({
    page: 1,
    pageSize: 12,
    filters: { industries: ['Tech'] }
  });

  // Automatic caching and background revalidation
  // Mutations auto-invalidate related queries
}
```

### Local Component State

```tsx
const [filters, setFilters] = useState({
  industries: [],
  fundingStages: [],
  // ...
});

const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [currentPage, setCurrentPage] = useState(1);
```

## Error Handling

```tsx
const { data, isLoading, error } = useStartups({...});

if (error) {
  return <div>Failed to load. {error.message}</div>;
}

if (isLoading) {
  return <LoadingSkeletons />;
}

return <StartupGrid startups={data.items} />;
```

## Performance Tips

1. **Memoize Filters**: Prevent unnecessary re-renders
   ```tsx
   const memoizedFilters = useMemo(() => filters, [filters]);
   ```

2. **Lazy Load Images**: Use Next.js Image component
   ```tsx
   <Image src={startup.logo} alt={startup.name} />
   ```

3. **Debounce Search**: Implemented in StartupSearch.tsx
   ```tsx
   const debouncedSearch = useMemo(
     () => debounce((query) => search(query), 300),
     []
   );
   ```

4. **Virtual Scrolling**: For very large lists, consider virtualization
   ```tsx
   import { FixedSizeList } from 'react-window';
   ```

## Testing Guide

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { StartupCard } from '@/features/startups/components/StartupCardComponent';

test('displays startup name and tagline', () => {
  const startup = { name: 'Test', tagline: 'Test tag' };
  render(<StartupCard startup={startup} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Integration Test Example

```typescript
test('filters and displays startups', async () => {
  render(<StartupsPage />);
  
  // Apply filters
  const filterBtn = screen.getByText('Tech');
  await userEvent.click(filterBtn);
  
  // Check results updated
  await waitFor(() => {
    expect(screen.getByText('Tech Startup')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Filters not updating results
- Check React Query query keys match filter parameters
- Ensure `setCurrentPage(1)` when filters change
- Verify backend filters are recognized

### Issue: Search not showing results
- Check API endpoint returns correct format
- Verify debounce delay is appropriate
- Check network tab for failed requests

### Issue: Images not loading
- Use absolute URLs for logos
- Add error handling in Image component
- Check CORS headers from logo CDN

### Issue: Pagination not working
- Verify `totalPages` returned from backend
- Check page state updates correctly
- Ensure offset calculation is correct
