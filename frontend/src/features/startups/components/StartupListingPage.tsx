'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  GridIcon,
  ListIcon,
  FilterIcon,
  SortDescIcon,
  SearchIcon,
  XIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ClockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingGrid, LoadingSkeleton } from '@/components/ui/loading';
import { useSearchFilters, usePagination, useSort } from '@/hooks/useUrlState';
import { cn } from '@/lib/utils';
import { StartupCard } from '@/features/startups/components/StartupCardComponent';
import { StartupListItem } from './StartupListItem';
import { FilterSidebar } from './FilterSidebar';
import { StartupFilters } from './StartupFilters';

import { Startup } from '@/features/startups/types';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'trending' | 'funding' | 'recent' | 'alphabetical';

export function StartupListingPage() {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  // URL state management
  const { urlState: filters, setUrlState: setFilters } = useSearchFilters();
  const { page, setPage } = usePagination(1, 12);
  const { sort, setSort } = useSort('relevance');

  // Mock data for demonstration
  const mockStartups: Startup[] = [
    {
      id: '1',
      name: 'NeuralFlow AI',
      slug: 'neuralflow-ai',
      description: 'Revolutionary AI platform that automates complex data analysis and provides real-time insights for enterprise decision making.',
      industry: 'AI & Machine Learning',
      location: { city: 'San Francisco', country: 'USA' },
      founded: '2023-01-01',
      logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
      website: 'https://neuralflow.ai',
      totalFunded: 15200000,
      fundingStage: 'SERIES_A',
      employeeCount: '11-50',
      verified: true,
      trending: true,
      status: 'ACTIVE',
      tagline: 'AI for Enterprise Decisions',
      foundersCount: 2,
      followersCount: 5000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      founders: [
        { id: 'f1', name: 'Sarah Chen', role: 'CEO & Co-founder' },
        { id: 'f2', name: 'Marcus Rodriguez', role: 'CTO & Co-founder' }
      ],
      tags: ['AI', 'Enterprise', 'Analytics', 'B2B']
    },
    {
      id: '2',
      name: 'GreenTech Solutions',
      slug: 'greentech-solutions',
      description: 'Building sustainable energy storage solutions using revolutionary battery technology for renewable energy systems.',
      industry: 'CleanTech',
      location: { city: 'Berlin', country: 'Germany' },
      founded: '2022-03-15',
      logo: 'https://ui-avatars.com/api/?name=GreenTech+Solutions&background=10b981&color=fff&size=128',
      website: 'https://greentechsolutions.com',
      totalFunded: 22500000,
      fundingStage: 'SERIES_B',
      employeeCount: '51-100',
      verified: true,
      trending: false,
      status: 'ACTIVE',
      tagline: 'Sustainable Energy for Tomorrow',
      foundersCount: 2,
      followersCount: 3400,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      founders: [
        { id: 'f3', name: 'Dr. Elena Kowalski', role: 'CEO & Founder' },
        { id: 'f4', name: 'James Mitchell', role: 'Head of Engineering' }
      ],
      tags: ['CleanTech', 'Energy', 'Sustainability', 'Hardware']
    },
    {
      id: '3',
      name: 'HealthBridge',
      slug: 'healthbridge',
      description: 'Connecting patients with healthcare providers through AI-powered telemedicine platform with real-time health monitoring.',
      industry: 'HealthTech',
      location: { city: 'London', country: 'UK' },
      founded: '2024-02-01',
      logo: 'https://ui-avatars.com/api/?name=HealthBridge&background=ef4444&color=fff&size=128',
      website: 'https://healthbridge.io',
      totalFunded: 8700000,
      fundingStage: 'SEED',
      employeeCount: '11-50',
      verified: true,
      trending: true,
      status: 'ACTIVE',
      tagline: 'Connecting Patients & Providers',
      foundersCount: 2,
      followersCount: 1200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      founders: [
        { id: 'f5', name: 'Dr. Amara Okafor', role: 'CEO & Co-founder' },
        { id: 'f6', name: 'Thomas Anderson', role: 'CPO & Co-founder' }
      ],
      tags: ['HealthTech', 'Telemedicine', 'AI', 'SaaS']
    },
    // Add more mock startups...
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `startup-${i + 4}`,
      name: `Startup ${i + 4}`,
      slug: `startup-${i + 4}`,
      description: `Innovative company working on cutting-edge technology solutions for modern businesses and consumers.`,
      industry: ['Fintech', 'EdTech', 'E-Commerce', 'Mobility'][i % 4],
      location: {
        city: ['New York', 'Austin', 'Toronto', 'Singapore'][i % 4],
        country: ['USA', 'USA', 'Canada', 'Singapore'][i % 4]
      },
      founded: '2020-01-01',
      logo: `https://ui-avatars.com/api/?name=Startup+${i + 4}&background=${['3b82f6', '8b5cf6', 'f59e0b', 'ef4444'][i % 4]}&color=fff&size=128`,
      totalFunded: [2100000, 5400000, 12800000, 25600000][i % 4],
      fundingStage: ['SEED', 'SERIES_A', 'SERIES_B', 'GROWTH'][i % 4] as any,
      employeeCount: ['1-10', '11-50', '51-100', '101-500'][i % 4] as any,
      verified: i % 3 === 0,
      trending: i % 4 === 0,
      status: 'ACTIVE' as const,
      tagline: 'Leading Innovation',
      foundersCount: 1,
      followersCount: 100 * (i + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      founders: [
        { id: `f-${i}`, name: `Founder ${i + 1}`, role: 'CEO' }
      ],
      tags: ['Tech', 'Innovation']
    }))
  ];

  // Filter and sort startups
  const filteredAndSortedStartups = useMemo(() => {
    let filtered = [...mockStartups];

    // Apply filters
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(startup =>
        startup.name.toLowerCase().includes(query) ||
        startup.description.toLowerCase().includes(query) ||
        startup.industry.toLowerCase().includes(query) ||
        (startup.tags && startup.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (filters.industry) {
      filtered = filtered.filter(startup => startup.industry === filters.industry);
    }

    if (filters.location) {
      filtered = filtered.filter(startup =>
        startup.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        startup.location.country.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.fundingStage) {
      filtered = filtered.filter(startup => startup.fundingStage === filters.fundingStage);
    }

    if (filters.foundedYear) {
      const getYear = (dateStr: string) => new Date(dateStr).getFullYear();

      if (filters.foundedYear === 'before-2010') {
        filtered = filtered.filter(startup => getYear(startup.founded) < 2010);
      } else if (filters.foundedYear.includes('-')) {
        const [start, end] = filters.foundedYear.split('-').map(Number);
        filtered = filtered.filter(startup => {
          const year = getYear(startup.founded);
          return year >= start && year <= end;
        });
      } else {
        filtered = filtered.filter(startup =>
          getYear(startup.founded) === parseInt(filters.foundedYear)
        );
      }
    }

    if (filters.verified) {
      filtered = filtered.filter(startup => startup.verified);
    }

    if (filters.trending) {
      filtered = filtered.filter(startup => startup.trending);
    }

    // Apply sorting
    switch (sort) {
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      case 'funding':
        filtered.sort((a, b) => {
          const aFunding = a.totalFunded || 0;
          const bFunding = b.totalFunded || 0;
          return bFunding - aFunding;
        });
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.founded).getTime() - new Date(a.founded).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [filters, sort, mockStartups]);

  // Pagination
  const itemsPerPage = filters.limit || 12;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStartups = filteredAndSortedStartups.slice(0, endIndex);
  const hasMore = endIndex < filteredAndSortedStartups.length;

  // Load more (infinite scroll simulation)
  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage(page + 1);
      setLoadingMore(false);
    }, 1000);
  };

  // Initial load simulation
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);


  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: <SearchIcon className="h-4 w-4" /> },
    { value: 'trending', label: 'Trending', icon: <TrendingUpIcon className="h-4 w-4" /> },
    { value: 'funding', label: 'Funding', icon: <DollarSignIcon className="h-4 w-4" /> },
    { value: 'recent', label: 'Recent', icon: <ClockIcon className="h-4 w-4" /> },
    { value: 'alphabetical', label: 'A-Z', icon: <SortDescIcon className="h-4 w-4" /> },
  ];

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== '' && value !== false && value !== 1 && value !== 12 && value !== 'relevance'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Discover Startups
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {filteredAndSortedStartups.length.toLocaleString()} innovative companies
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SortDescIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  <GridIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            setFilters={setFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            <StartupFilters
              filters={filters}
              setFilters={setFilters}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Results */}
            {loading ? (
              <LoadingGrid count={12} />
            ) : filteredAndSortedStartups.length === 0 ? (
              <EmptyState filters={filters} setFilters={setFilters} />
            ) : (
              <>
                <div className={cn(
                  'transition-all duration-300',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                )}>
                  {paginatedStartups.map((startup, index) => (

                    viewMode === 'grid' ? (
                      <StartupCard
                        key={startup.id}
                        startup={startup}
                      />
                    ) : (
                      <StartupListItem
                        key={startup.id}
                        startup={startup}
                      />
                    )
                  ))}
                </div>

                {/* Load More / Infinite Scroll */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    {loadingMore ? (
                      <div className="flex justify-center">
                        <LoadingSkeleton className="h-12 w-32" />
                      </div>
                    ) : (
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        size="lg"
                        className="px-8"
                      >
                        Load More Startups
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  filters,
  setFilters
}: {
  filters: any;
  setFilters: (filters: any) => void;
}) {
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== '' && value !== false && value !== 1 && value !== 12 && value !== 'relevance'
  );

  const clearFilters = () => {
    setFilters({
      q: '',
      industry: '',
      location: '',
      fundingStage: '',
      foundedYear: '',
      verified: false,
      trending: false,
    });
  };

  return (
    <div className="text-center py-16">
      <div className="mx-auto max-w-md">
        <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No startups found
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {hasActiveFilters
            ? "Try adjusting your filters to see more results."
            : "No startups match your current search criteria."
          }
        </p>
        {hasActiveFilters && (
          <div className="mt-6">
            <Button onClick={clearFilters} variant="outline">
              <XIcon className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
