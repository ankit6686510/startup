# Startups Discovery - Developer Examples

Complete working examples for common use cases.

## Table of Contents

1. [Browse/Search Page](#browsesearch-page)
2. [Custom Startup List](#custom-startup-list)
3. [Filter by Industry](#filter-by-industry)
4. [Startup Detail View](#startup-detail-view)
5. [Comparison Component](#comparison-component)
6. [Saving/Following](#savingfollowing)
7. [Custom Card](#custom-card)

---

## Browse/Search Page

### Basic Setup

```tsx
'use client';

import { useState } from 'react';
import { StartupCard } from '@/features/startups';
import { StartupFilters } from '@/features/startups';
import { StartupSearch } from '@/features/startups';
import { useStartups } from '@/features/startups';

export default function BrowseStartups() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    industries: [],
    fundingStages: [],
    fundingMin: '',
    fundingMax: '',
    locations: [],
    statuses: [],
    employeeRanges: [],
  });

  const { data, isLoading } = useStartups({
    page,
    pageSize: 12,
    filters,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1">
        <StartupFilters onChange={setFilters} />
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <StartupSearch />

        {/* Results Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 h-64 rounded" />
            ))
          ) : (
            data?.items.map((startup) => (
              <StartupCard 
                key={startup.id} 
                startup={startup} 
                variant="grid"
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-8 flex gap-2 justify-center">
            {Array.from({ length: data.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## Custom Startup List

### Industry-Specific Listing

```tsx
import { StartupCard } from '@/features/startups';
import { useStartups } from '@/features/startups';

interface IndustryShowcaseProps {
  industry: string;
  title: string;
}

export function IndustryShowcase({ industry, title }: IndustryShowcaseProps) {
  const { data, isLoading } = useStartups({
    page: 1,
    pageSize: 6,
    filters: {
      industries: [industry],
    },
  });

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 h-64 rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data?.items.map((startup) => (
            <StartupCard 
              key={startup.id} 
              startup={startup}
              variant="grid"
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Usage
<IndustryShowcase industry="AI/ML" title="AI & Machine Learning Startups" />
<IndustryShowcase industry="Healthcare" title="HealthTech Innovators" />
```

---

## Filter by Industry

### Multi-Filter Example

```tsx
'use client';

import { useState } from 'react';
import { useStartups } from '@/features/startups';
import { StartupCard } from '@/features/startups';

export function FilteredStartups() {
  const [fundingRange, setFundingRange] = useState({
    min: 1000000,    // $1M
    max: 100000000,  // $100M
  });

  const { data } = useStartups({
    page: 1,
    pageSize: 20,
    filters: {
      industries: ['Tech', 'AI/ML'],
      fundingStages: ['SERIES_A', 'SERIES_B', 'SERIES_C'],
      fundingMin: fundingRange.min,
      fundingMax: fundingRange.max,
      locations: ['San Francisco', 'New York', 'London'],
      statuses: ['ACTIVE'],
    },
  });

  return (
    <div>
      {/* Funding Range Slider */}
      <div className="mb-6">
        <label>Funding Range</label>
        <div className="flex gap-4 mt-2">
          <input
            type="number"
            value={fundingRange.min}
            onChange={(e) =>
              setFundingRange({
                ...fundingRange,
                min: parseInt(e.target.value),
              })
            }
            placeholder="Min"
            className="flex-1 px-3 py-2 border rounded"
          />
          <input
            type="number"
            value={fundingRange.max}
            onChange={(e) =>
              setFundingRange({
                ...fundingRange,
                max: parseInt(e.target.value),
              })
            }
            placeholder="Max"
            className="flex-1 px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        {data?.items.map((startup) => (
          <StartupCard key={startup.id} startup={startup} variant="list" />
        ))}
      </div>
    </div>
  );
}
```

---

## Startup Detail View

### Full Profile Page

```tsx
'use client';

import { useStartupDetail } from '@/features/startups';
import { TeamSection } from '@/features/startups';
import { NewsTimeline } from '@/features/startups';

interface StartupProfileProps {
  startupId: string;
}

export function StartupProfile({ startupId }: StartupProfileProps) {
  const { data: startup, isLoading, error } = useStartupDetail(startupId);

  if (error) {
    return <div className="text-red-600">Failed to load startup</div>;
  }

  if (isLoading || !startup) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex gap-6 mb-8">
        <img
          src={startup.logo}
          alt={startup.name}
          className="w-32 h-32 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{startup.name}</h1>
          <p className="text-xl text-gray-600 mt-1">{startup.tagline}</p>

          <div className="flex gap-4 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Follow
            </button>
            <button className="px-4 py-2 border rounded">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded">
          <p className="text-gray-600 text-sm">Funding Stage</p>
          <p className="text-lg font-bold">{startup.fundingStage}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded">
          <p className="text-gray-600 text-sm">Total Funded</p>
          <p className="text-lg font-bold">
            ${(startup.totalFunded / 1000000).toFixed(0)}M
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded">
          <p className="text-gray-600 text-sm">Founded</p>
          <p className="text-lg font-bold">
            {new Date(startup.founded).getFullYear()}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded">
          <p className="text-gray-600 text-sm">Employees</p>
          <p className="text-lg font-bold">{startup.employeeCount}</p>
        </div>
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-700 leading-relaxed">{startup.description}</p>
      </section>

      {/* Team */}
      <TeamSection team={startup.team || []} />

      {/* News */}
      <div className="mt-8">
        <NewsTimeline news={startup.news || []} />
      </div>

      {/* Jobs */}
      {startup.jobs && startup.jobs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          <div className="space-y-2">
            {startup.jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded hover:bg-slate-50"
              >
                <h3 className="font-bold">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.location}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Comparison Component

### Compare Multiple Startups

```tsx
'use client';

import { useState } from 'react';
import { useStartups } from '@/features/startups';
import { StartupComparison } from '@/features/startups';
import { StartupsAPI } from '@/features/startups';

export function ComparisonTool() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);

  const { data: allStartups } = useStartups({
    page: 1,
    pageSize: 20,
    filters: {},
  });

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;

    const api = StartupsAPI.getInstance();
    const data = await api.compareStartups(selectedIds);
    setComparisonData(data);
  };

  return (
    <div className="space-y-6">
      {/* Selection */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Select Startups ({selectedIds.length}/4)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {allStartups?.items.map((startup) => (
            <div
              key={startup.id}
              onClick={() => toggleSelection(startup.id)}
              className={`p-4 border-2 rounded cursor-pointer transition ${
                selectedIds.includes(startup.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold">{startup.name}</h3>
              <p className="text-sm text-gray-600">{startup.tagline}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={selectedIds.length < 2}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Compare Selected
      </button>

      {/* Results */}
      {comparisonData && (
        <div>
          <h2 className="text-xl font-bold mb-4">Comparison Results</h2>
          <StartupComparison startups={comparisonData} />
        </div>
      )}
    </div>
  );
}
```

---

## Saving/Following

### Follow and Save Actions

```tsx
'use client';

import { useToggleFollowStartup, useToggleSaveStartup } from '@/features/startups';

interface ActionButtonsProps {
  startupId: string;
  isFollowing?: boolean;
  isSaved?: boolean;
}

export function StartupActionButtons({
  startupId,
  isFollowing = false,
  isSaved = false,
}: ActionButtonsProps) {
  const { mutate: toggleFollow, isPending: isFollowLoading } = 
    useToggleFollowStartup();
  
  const { mutate: toggleSave, isPending: isSaveLoading } = 
    useToggleSaveStartup();

  return (
    <div className="flex gap-3">
      <button
        onClick={() => toggleFollow({ startupId, follow: !isFollowing })}
        disabled={isFollowLoading}
        className={`px-4 py-2 rounded transition ${
          isFollowing
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        } disabled:opacity-50`}
      >
        {isFollowing ? '✓ Following' : '+ Follow'}
      </button>

      <button
        onClick={() => toggleSave({ startupId, save: !isSaved })}
        disabled={isSaveLoading}
        className={`px-4 py-2 rounded transition ${
          isSaved
            ? 'bg-yellow-200 text-yellow-900'
            : 'bg-gray-200 text-gray-900'
        } disabled:opacity-50`}
      >
        {isSaved ? '⭐ Saved' : '☆ Save'}
      </button>
    </div>
  );
}

// Usage
<StartupActionButtons 
  startupId="startup-001" 
  isFollowing={true}
  isSaved={false}
/>
```

---

## Custom Card

### Extended Startup Card

```tsx
import { Startup } from '@/features/startups';

interface CustomStartupCardProps {
  startup: Startup;
  showRating?: boolean;
  onCompare?: (id: string) => void;
}

export function CustomStartupCard({
  startup,
  showRating = false,
  onCompare,
}: CustomStartupCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      {/* Logo and Badge */}
      <div className="flex items-start justify-between mb-4">
        <img
          src={startup.logo}
          alt={startup.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {startup.fundingStage}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900">{startup.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{startup.tagline}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 my-4 text-sm">
        <div>
          <p className="text-gray-500">Funding</p>
          <p className="font-bold">
            ${(startup.totalFunded / 1000000).toFixed(0)}M
          </p>
        </div>
        <div>
          <p className="text-gray-500">Followers</p>
          <p className="font-bold">{startup.followersCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Rating (Optional) */}
      {showRating && (
        <div className="mb-4 pb-4 border-b">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Based on user reviews</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onCompare?.(startup.id)}
          className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-50 transition"
        >
          Compare
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          View
        </button>
      </div>
    </div>
  );
}
```

---

## Advanced Search Example

### Search with Categories

```tsx
'use client';

import { useStartupSearch } from '@/features/startups';
import { useState } from 'react';

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'ai' | 'health' | 'fintech'>('all');

  const { data: results, isLoading } = useStartupSearch(query);

  const filtered = results?.filter((startup) => {
    if (category === 'ai') return startup.industry === 'AI/ML';
    if (category === 'health') return startup.industry === 'Healthcare';
    if (category === 'fintech') return startup.industry === 'Finance';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search startups..."
        className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      {/* Category Filter */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {(['all', 'ai', 'health', 'fintech'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded transition ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            {cat === 'all' && 'All'}
            {cat === 'ai' && 'AI/ML'}
            {cat === 'health' && 'Healthcare'}
            {cat === 'fintech' && 'FinTech'}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading && <p className="mt-4 text-gray-600">Searching...</p>}

      {filtered && filtered.length > 0 ? (
        <div className="mt-6 space-y-2">
          {filtered.map((startup) => (
            <div
              key={startup.id}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={startup.logo}
                  alt={startup.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{startup.name}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {startup.tagline}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{startup.industry}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        query && <p className="mt-4 text-gray-600">No results found</p>
      )}
    </div>
  );
}
```

---

## Tips for Developers

### 1. Using with Next.js Suspense

```tsx
import { Suspense } from 'react';

<Suspense fallback={<LoadingSkeletons />}>
  <StartupsList />
</Suspense>
```

### 2. Error Boundaries

```tsx
'use client';

import { ErrorBoundary } from 'react-error-boundary';

export function SafeStartupDisplay() {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load startups</div>}
      onError={(error) => console.error('Startup error:', error)}
    >
      <StartupsPage />
    </ErrorBoundary>
  );
}
```

### 3. Query Caching

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Prefetch data
queryClient.prefetchQuery({
  queryKey: ['startups', 1],
  queryFn: () => api.getStartups({ page: 1, pageSize: 12 }),
});
```

### 4. Optimistic Updates

```tsx
const { mutate: toggleFollow } = useToggleFollowStartup({
  onMutate: async (variables) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({
      queryKey: ['startup', variables.startupId],
    });

    // Optimistically update UI
    const previousData = queryClient.getQueryData(['startup', variables.startupId]);
    // ... update cache
    
    return { previousData };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(['startup', variables.startupId], context.previousData);
    }
  },
});
```

---

This guide covers the most common use cases. For more information, see the main documentation files.
