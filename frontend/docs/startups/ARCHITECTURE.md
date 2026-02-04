# 🏗️ Startups Discovery - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                 │
│  /startups                /startups/:id        /startups/compare │
│     │                          │                      │          │
│     └──────────────────────────┴──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS PAGES                               │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Browse Page     │  │  Profile Page    │  │ Compare Page │  │
│  │  page.tsx        │  │  [id]/page.tsx   │  │ compare/...  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
└───────────┼──────────────────────┼───────────────────┼───────────┘
            │                      │                   │
            ▼                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENTS                           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ StartupFilters  │  StartupSearch  │  StartupCard      │    │
│  │ (8 dimensions)  │  (autocomplete) │  (grid/list)      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ StartupComparison │ TeamSection │ NewsTimeline        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              REACT QUERY HOOKS & STATE                          │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ useStartups      │  │ useStartupDetail │  │ useStartup   │  │
│  │ useStartupSearch │  │ useStartupJobs   │  │ useStartupNews
│  │ useTrendingStups │  │ useTeamData      │  │ useComparison│  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                   │           │
│  ┌────────┴──────────────────────┴───────────────────┴────────┐ │
│  │        Mutations                                          │ │
│  │  useToggleFollowStartup  │  useToggleSaveStartup         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API CLIENT LAYER                              │
│                                                                 │
│  StartupsAPI (Singleton)                                      │
│  ├── getStartups()           ┌─ Cache: 5min  │ 10min       │
│  ├── getStartupById()        ├─ Cache: 10min │ 30min       │
│  ├── searchStartups()        ├─ Cache: 5min  │ 10min       │
│  ├── getTrendingStartups()   ├─ Cache: 30min │ 60min       │
│  ├── getStartupsByIndustry() ├─ Cache: 10min │ 30min       │
│  ├── getIndustryStats()      ├─ Cache: 60min │ 2hr         │
│  ├── getStartupJobs()        ├─ Cache: 5min  │ 10min       │
│  ├── getStartupNews()        ├─ Cache: 10min │ 30min       │
│  ├── getRelatedStartups()    ├─ Cache: 10min │ 30min       │
│  ├── toggleFollowStartup()   └─ Invalidates list caches    │
│  ├── toggleSaveStartup()     └─ Invalidates saved caches   │
│  ├── getSavedStartups()                                    │
│  ├── getSuggestedStartups()                                │
│  └── compareStartups()                                      │
│                                                                 │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
              JWT Interceptor │
           (Automatic Token)  │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND API (14 Endpoints)                        │
│                                                                 │
│  GET    /api/startups          ┐                              │
│  GET    /api/startups/:id      │                              │
│  GET    /api/startups/search   │                              │
│  GET    /api/startups/trending ├─ Query Endpoints            │
│  GET    /api/startups/industry/:id                           │
│  GET    /api/startups/stats/industries                       │
│  GET    /api/startups/:id/jobs                              │
│  GET    /api/startups/:id/news                              │
│  GET    /api/startups/:id/related                           │
│  GET    /api/startups/saved    ┘                             │
│  GET    /api/startups/suggested                              │
│                                                                 │
│  POST   /api/startups/compare  ┐                              │
│  POST   /api/startups/:id/follow ├─ Mutation Endpoints        │
│  POST   /api/startups/:id/save ┘                              │
│                                                                 │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE LAYER                                 │
│                                                                 │
│  startups        │ team_members   │ funding_rounds             │
│  ├─ id           │ ├─ id          │ ├─ id                     │
│  ├─ name         │ ├─ startup_id  │ ├─ startup_id             │
│  ├─ tagline      │ ├─ name        │ ├─ stage                  │
│  ├─ description  │ ├─ role        │ ├─ amount                 │
│  ├─ logo         │ ├─ bio         │ ├─ date                   │
│  ├─ funding_stage│ └─ linkedin    │ └─ investors              │
│  ├─ total_funded │                │                           │
│  ├─ industry     │  jobs          │ news_articles             │
│  ├─ location     │ ├─ id          │ ├─ id                     │
│  └─ employees    │ ├─ startup_id  │ ├─ startup_id             │
│                  │ ├─ title       │ ├─ title                  │
│  user_startups   │ └─ location    │ ├─ summary                │
│  ├─ user_id      │                │ ├─ source                 │
│  ├─ startup_id   │                │ └─ published_at           │
│  ├─ is_following │                │                           │
│  └─ is_saved     │                │                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Browse & Search Flow

```
User Types            Search Input
  │                        │
  │                        ▼
  │                   debounce(300ms)
  │                        │
  │                        ▼
  └──────────► useStartupSearch()
                        │
                        ▼
                   API: /search
                        │
                        ▼
                  Cache Check
                   ├─ Hit → Return cached
                   └─ Miss → Fetch new
                        │
                        ▼
                   StartupCard Components
                        │
                        ▼
                    Render Results
```

### Filter & Pagination Flow

```
User Applies         Pagination
  Filters              Changes
    │                      │
    └──────┬───────────────┘
           │
           ▼
    setFilters()
           │
           ▼
    setPage(1)  ← Reset to first page
           │
           ▼
    useStartups({
      page,
      pageSize,
      filters
    })
           │
           ▼
    API: GET /api/startups?...
           │
           ▼
      React Query
      Cache invalidation
           │
           ▼
      Fetch new data
           │
           ▼
      Render updated list
```

### Detail Page Flow

```
User Clicks              Route Change
  Card Item                   │
    │                         ▼
    └──────► /startups/:id
                    │
                    ▼
         useStartupDetail(id)
                    │
                    ▼
         API: GET /api/startups/:id
                    │
                    ▼
            React Query Caching
            10min stale time
            30min cache time
                    │
                    ▼
         Parallel Queries (React.js Concurrent)
         ├─ getStartupJobs()
         ├─ getStartupNews()
         └─ getStartupRelated()
                    │
                    ▼
       Render Profile with Tabs
       ├─ Overview (description, metrics)
       ├─ Team (founders list)
       ├─ Jobs (open positions)
       └─ News (press mentions)
```

### Follow/Save Flow

```
User Clicks              Optimistic Update
  Follow/Save              (Update UI first)
    │                            │
    └────┬────────────────────────┘
         │
         ▼
  useToggleFollowStartup() /
  useToggleSaveStartup()
         │
         ▼
    API Request
    POST /api/startups/:id/follow
         │
         ▼
    ┌─ Success
    │  └─ Confirm optimistic update
    │     Query invalidation
    │     ├─ startup detail
    │     ├─ startup list
    │     └─ saved startups
    │
    └─ Failure
       └─ Rollback UI
          Show error toast
```

---

## File Organization

### Feature-Based Structure

```
src/features/startups/
│
├── types.ts                          ← Data type definitions
│   ├── Startup interface
│   ├── StartupDetail interface
│   ├── Supporting interfaces
│   └── Enums (FundingStage, etc.)
│
├── api.ts                            ← API client
│   ├── StartupsAPI class
│   ├── 11 query methods
│   ├── 2 mutation methods
│   └── JWT interceptor
│
├── hooks.ts                          ← React Query hooks
│   ├── Query key factory
│   ├── 11 query hooks
│   └── 2 mutation hooks
│
├── index.ts                          ← Barrel export
│   └── Re-export everything
│
└── components/
    ├── StartupCardComponent.tsx      ← Card display (grid/list)
    ├── StartupFilters.tsx            ← Filter UI (8 dimensions)
    ├── StartupSearch.tsx             ← Search autocomplete
    ├── StartupComparison.tsx         ← Comparison table
    ├── TeamSection.tsx               ← Team display
    └── NewsTimeline.tsx              ← News feed
```

### Pages Structure

```
src/app/startups/
│
├── page.tsx                          ← Browse/search page
│   ├── Sidebar filters
│   ├── Search bar
│   ├── Grid/list toggle
│   ├── Results grid
│   └── Pagination
│
├── [id]/
│   └── page.tsx                      ← Profile page
│       ├── Header with logo
│       ├── Tabbed interface
│       │   ├── Overview
│       │   ├── Team
│       │   ├── Jobs
│       │   └── News
│       └── Follow/save buttons
│
└── compare/
    ├── page.tsx                      ← Comparison selector
    │   ├── Startup grid
    │   ├── Selection sidebar
    │   └── Compare button
    │
    └── [ids]/
        └── page.tsx                  ← Comparison results
            └── Comparison table
```

---

## Component Hierarchy

```
<StartupPage>
│
├─ <StartupSearch />
│  └─ useStartupSearch()
│
├─ <StartupFilters />
│  └─ Controlled by state
│
└─ <div className="grid grid-cols-3">
   │
   ├─ <StartupCard variant="grid">
   │  └─ ShowFollowButton()
   │     └─ useToggleFollowStartup()
   │
   ├─ <StartupCard variant="grid">
   │  └─ ShowSaveButton()
   │     └─ useToggleSaveStartup()
   │
   └─ ... more cards
```

---

## State Management Strategy

### React Query (Server State)
- Startup data
- User's saved/followed list
- Search results
- Trending data
- Industry data

### React Component State
- Current page
- Filter values
- View mode (grid/list)
- Tab selection
- UI toggles

### Zustand (Global Auth)
- User token
- User ID
- Auth status

---

## Cache Strategy

| Query | Type | Fresh | Cache | Invalidate On |
|-------|------|-------|-------|---|
| Startups List | 5min | 10min | Any filter change, follow/save |
| Startup Detail | 10min | 30min | Any mutation |
| Search | 5min | 10min | Query change |
| Trending | 30min | 60min | Hourly refresh |
| Industry Stats | 60min | 2hr | Daily refresh |
| Saved Startups | 5min | 10min | Save/unsave |
| Jobs | 5min | 10min | Parent detail refresh |
| News | 10min | 30min | Parent detail refresh |

---

## Performance Optimizations

```
┌──────────────────────────────┐
│   Image Optimization         │
│   (Next.js Image component)  │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Code Splitting             │
│   (Automatic per route)      │
└──────────────────────────────┘

┌──────────────────────────────┐
│   React Query Caching        │
│   (Deduplication & stale-    │
│    while-revalidate)         │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Search Debouncing          │
│   (300ms delay)              │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Skeleton Loaders           │
│   (Better perceived perf)    │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Lazy Loading               │
│   (Pagination & scroll)      │
└──────────────────────────────┘
```

---

## Error Handling Flow

```
User Action
    │
    ▼
API Request
    │
    ├─ Network Error
    │  └─ Toast: "Network error, retrying..."
    │     └─ Auto-retry with backoff
    │
    ├─ 404 Not Found
    │  └─ Redirect to error page
    │
    ├─ 400 Bad Request
    │  └─ Toast: "Invalid filter"
    │
    ├─ 401 Unauthorized
    │  └─ Redirect to login
    │
    └─ Success (200)
       └─ Update UI
          Update cache
          Show toast if needed
```

---

## Security Layers

```
Client-side:
├─ XSS Prevention (React/Next.js)
├─ CSRF Tokens (for mutations)
└─ Input validation

Network:
├─ HTTPS enforcement
├─ JWT authentication
└─ CORS headers

API:
├─ Token validation
├─ Rate limiting
├─ Input sanitization
└─ SQL injection prevention

Database:
├─ Access control
├─ Encryption at rest
└─ Audit logging
```

---

## Testing Architecture

```
Unit Tests
├─ StartupCard component
├─ StartupFilters component
├─ API methods
└─ Hook logic

Integration Tests
├─ Filter + Search together
├─ Pagination
├─ Follow/Save
└─ Detail page tabs

E2E Tests
├─ Browse flow
├─ Search flow
├─ Profile view
└─ Comparison flow
```

---

## Deployment Strategy

```
Development
    │
    ▼
Local Testing (npm run dev)
    │
    ▼
Staging Deployment
    │
    ├─ API endpoint verification
    ├─ Cache testing
    └─ Load testing
    │
    ▼
Production Deployment
    │
    ├─ Monitor cache hit rate
    ├─ Monitor API latency
    └─ Monitor errors
```

---

## Monitoring Points

```
Frontend Metrics
├─ Page load time
├─ Time to interactive
├─ Largest contentful paint
├─ Cumulative layout shift
└─ First input delay

API Metrics
├─ Request latency
├─ Error rate
├─ Cache hit rate
└─ Rate limiting

User Metrics
├─ Search usage
├─ Filter usage
├─ Profile views
└─ Follow/save actions
```

This architecture ensures:
- ✅ Scalability
- ✅ Performance
- ✅ Maintainability
- ✅ Type safety
- ✅ Error resilience
- ✅ User experience
