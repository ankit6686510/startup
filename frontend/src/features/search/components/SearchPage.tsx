'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  SearchIcon, 
  FilterIcon, 
  XIcon, 
  ClockIcon, 
  BookmarkIcon,
  TrendingUpIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingIcon,
  ChevronDownIcon,
  StarIcon,
  MapPinIcon,
  DollarSignIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingGrid, LoadingSkeleton } from '@/components/ui/loading';
import { useSearchFilters } from '@/hooks/useSearchUrlState';
import { useSearchHistory } from '@/stores/application';
import { cn } from '@/lib/utils';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    industry?: string;
    location?: string;
    page?: string;
  };
}

interface SearchResult {
  id: string;
  type: 'startup' | 'founder' | 'job';
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  metadata: {
    location?: string;
    industry?: string;
    funding?: string;
    stage?: string;
    company?: string;
    salary?: string;
    experience?: string;
    verified?: boolean;
    trending?: boolean;
  };
  url: string;
}

export function SearchPage({ searchParams }: SearchPageProps) {
  const [searchInput, setSearchInput] = useState(searchParams.q || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { urlState: filters, setUrlState: setFilters } = useSearchFilters();
  const { searches, addSearch, removeSearch, saveSearch, getSavedSearches } = useSearchHistory();

  // Search suggestions data
  const suggestionKeywords = [
    'AI startups', 'Machine Learning', 'Fintech companies', 'Healthcare AI',
    'Y Combinator', 'Series A funding', 'Remote jobs', 'Frontend developer',
    'Product manager', 'Seed funding', 'San Francisco', 'New York startups',
    'Blockchain', 'SaaS companies', 'B2B startups', 'Consumer apps',
    'EdTech', 'CleanTech', 'Biotech', 'Cybersecurity'
  ];

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'startup',
      title: 'NeuralFlow AI',
      subtitle: 'AI & Machine Learning',
      description: 'Revolutionary AI platform that automates complex data analysis and provides real-time insights for enterprise decision making.',
      imageUrl: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=64',
      metadata: {
        location: 'San Francisco, CA',
        industry: 'AI & Machine Learning',
        funding: '$15.2M',
        stage: 'Series A',
        verified: true,
        trending: true
      },
      url: '/startups/neuralflow-ai'
    },
    {
      id: '2',
      type: 'founder',
      title: 'Sarah Chen',
      subtitle: 'CEO & Co-founder at NeuralFlow AI',
      description: 'Former VP of AI at Google, Stanford PhD in Computer Science. 10+ years building AI systems at scale.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b78b1aec?w=64&h=64&fit=crop&crop=face',
      metadata: {
        location: 'San Francisco, CA',
        company: 'NeuralFlow AI',
        experience: '10+ years',
        verified: true
      },
      url: '/founders/sarah-chen'
    },
    {
      id: '3',
      type: 'job',
      title: 'Senior Frontend Engineer',
      subtitle: 'NeuralFlow AI',
      description: 'Join our frontend team to build beautiful, responsive user interfaces for our AI platform.',
      metadata: {
        location: 'San Francisco, CA (Remote)',
        company: 'NeuralFlow AI',
        salary: '$140k - $180k',
        experience: '5+ years'
      },
      url: '/jobs/senior-frontend-engineer'
    },
    // Add more mock results...
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `result-${i + 4}`,
      type: ['startup', 'founder', 'job'][i % 3] as 'startup' | 'founder' | 'job',
      title: `Result ${i + 4}`,
      subtitle: `Subtitle ${i + 4}`,
      description: `Description for search result ${i + 4}`,
      metadata: {
        location: ['San Francisco, CA', 'New York, NY', 'London, UK'][i % 3],
        industry: 'Technology'
      },
      url: `/result-${i + 4}`
    }))
  ];

  const searchTypes = [
    { value: 'all', label: 'All Results', icon: <SearchIcon className="h-4 w-4" />, count: mockResults.length },
    { value: 'startups', label: 'Startups', icon: <BuildingIcon className="h-4 w-4" />, count: mockResults.filter(r => r.type === 'startup').length },
    { value: 'founders', label: 'Founders', icon: <UsersIcon className="h-4 w-4" />, count: mockResults.filter(r => r.type === 'founder').length },
    { value: 'jobs', label: 'Jobs', icon: <BriefcaseIcon className="h-4 w-4" />, count: mockResults.filter(r => r.type === 'job').length }
  ];

  // Filter results based on type
  const filteredResults = useMemo(() => {
    if (!filters.type || filters.type === 'all') return mockResults;
    const typeMap = { startups: 'startup', founders: 'founder', jobs: 'job' };
    return mockResults.filter(result => result.type === typeMap[filters.type as keyof typeof typeMap]);
  }, [filters.type, mockResults]);

  // Generate suggestions based on input
  useEffect(() => {
    if (searchInput.length > 0) {
      const filtered = suggestionKeywords
        .filter(keyword => keyword.toLowerCase().includes(searchInput.toLowerCase()))
        .slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  // Perform search
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    
    // Add to search history
    addSearch(query);
    
    // Update URL
    setFilters({ ...filters, q: query, page: 1 });
    
    // Simulate API call
    setTimeout(() => {
      setResults(filteredResults);
      setLoading(false);
    }, 800);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    handleSearch(suggestion);
  };

  const handleTypeFilter = (type: string) => {
    setFilters({ ...filters, type, page: 1 });
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters({ q: '', type: 'all', page: 1 });
    setResults([]);
  };

  const handleSaveSearch = () => {
    if (searchInput.trim()) {
      saveSearch({
        id: Date.now().toString(),
        query: searchInput,
        filters: { type: filters.type || 'all', industry: filters.industry, location: filters.location },
        timestamp: new Date().toISOString(),
        resultCount: filteredResults.length
      });
    }
  };

  // Initialize search from URL params
  useEffect(() => {
    if (searchParams.q) {
      setSearchInput(searchParams.q);
      handleSearch(searchParams.q);
    }
  }, []);

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== 1
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search startups, founders, jobs..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchInput);
                  }
                }}
                onFocus={() => setShowSuggestions(searchInput.length > 0)}
                className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                      >
                        <SearchIcon className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Types */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {searchTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value)}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    (filters.type || 'all') === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  )}
                >
                  {type.icon}
                  <span className="ml-2">{type.label}</span>
                  <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {type.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {searchInput && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSearch}
                  className="flex items-center"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Search History */}
            <SearchHistory searches={searches} onSearchClick={handleSuggestionClick} onRemove={removeSearch} />
            
            {/* Saved Searches */}
            <SavedSearches savedSearches={getSavedSearches()} onSearchClick={handleSuggestionClick} />
            
            {/* Quick Filters */}
            <QuickFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Results */}
            {loading ? (
              <LoadingGrid count={12} />
            ) : filteredResults.length === 0 && searchInput ? (
              <EmptySearchResults query={searchInput} onClearSearch={clearSearch} />
            ) : (
              <SearchResults results={filteredResults} query={searchInput} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search History Component
function SearchHistory({ 
  searches, 
  onSearchClick, 
  onRemove 
}: { 
  searches: string[]; 
  onSearchClick: (query: string) => void; 
  onRemove: (query: string) => void; 
}) {
  if (searches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Recent Searches
      </h3>
      <div className="space-y-2">
        {searches.slice(0, 5).map((search, index) => (
          <div key={index} className="flex items-center justify-between group">
            <button
              onClick={() => onSearchClick(search)}
              className="flex items-center text-left flex-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300 truncate">{search}</span>
            </button>
            <button
              onClick={() => onRemove(search)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Saved Searches Component
function SavedSearches({ 
  savedSearches, 
  onSearchClick 
}: { 
  savedSearches: any[]; 
  onSearchClick: (query: string) => void; 
}) {
  if (savedSearches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Saved Searches
      </h3>
      <div className="space-y-3">
        {savedSearches.slice(0, 3).map((saved) => (
          <button
            key={saved.id}
            onClick={() => onSearchClick(saved.query)}
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">{saved.query}</span>
              <BookmarkIcon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {saved.resultCount} results • {new Date(saved.timestamp).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Quick Filters Component
function QuickFilters() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Quick Filters
      </h3>
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trending</h4>
          <div className="flex flex-wrap gap-2">
            {['AI Startups', 'Series A', 'Remote Jobs'].map((filter) => (
              <span key={filter} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                {filter}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industries</h4>
          <div className="flex flex-wrap gap-2">
            {['Fintech', 'HealthTech', 'EdTech'].map((industry) => (
              <span key={industry} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Results Component
function SearchResults({ results, query }: { results: SearchResult[]; query: string }) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {query ? `Results for "${query}"` : 'All Results'}
        </h2>
        <span className="text-gray-500 dark:text-gray-400">
          {results.length} results
        </span>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

// Search Result Card
function SearchResultCard({ result }: { result: SearchResult }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'startup': return <BuildingIcon className="h-5 w-5" />;
      case 'founder': return <UsersIcon className="h-5 w-5" />;
      case 'job': return <BriefcaseIcon className="h-5 w-5" />;
      default: return <SearchIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'startup': return 'text-blue-600 dark:text-blue-400';
      case 'founder': return 'text-green-600 dark:text-green-400';
      case 'job': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
      onClick={() => window.location.href = result.url}
    >
      <div className="flex items-start space-x-4">
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={result.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={cn('flex items-center text-sm font-medium', getTypeColor(result.type))}>
              {getTypeIcon(result.type)}
              <span className="ml-1 capitalize">{result.type}</span>
            </span>
            {result.metadata.verified && (
              <StarIcon className="h-4 w-4 text-blue-500 fill-current" />
            )}
            {result.metadata.trending && (
              <TrendingUpIcon className="h-4 w-4 text-orange-500" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {result.title}
          </h3>
          
          <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">
            {result.subtitle}
          </p>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {result.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {result.metadata.location && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {result.metadata.location}
              </div>
            )}
            {result.metadata.funding && (
              <div className="flex items-center">
                <DollarSignIcon className="h-4 w-4 mr-1" />
                {result.metadata.funding}
              </div>
            )}
            {result.metadata.salary && (
              <div className="flex items-center">
                <DollarSignIcon className="h-4 w-4 mr-1" />
                {result.metadata.salary}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty Search Results
function EmptySearchResults({ query, onClearSearch }: { query: string; onClearSearch: () => void }) {
  return (
    <div className="text-center py-16">
      <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No results found for "{query}"
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Try adjusting your search terms or browse our trending searches.
      </p>
      <Button onClick={onClearSearch} variant="outline">
        Clear Search
      </Button>
    </div>
  );
}
