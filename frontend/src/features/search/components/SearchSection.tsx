'use client';

import { useState } from 'react';
import { SearchIcon, FilterIcon, MapPinIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  industry: string;
  location: string;
  fundingStage: string;
  foundedYear: string;
}

export function SearchSection() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    industry: '',
    location: '',
    fundingStage: '',
    foundedYear: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const industries = [
    { value: '', label: 'All Industries' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'fintech', label: 'Fintech' },
    { value: 'healthtech', label: 'HealthTech' },
    { value: 'edtech', label: 'EdTech' },
    { value: 'cleantech', label: 'CleanTech' },
    { value: 'ecommerce', label: 'E-Commerce' },
    { value: 'mobility', label: 'Mobility' },
    { value: 'gaming', label: 'Gaming' },
  ];

  const fundingStages = [
    { value: '', label: 'All Stages' },
    { value: 'pre-seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series-a', label: 'Series A' },
    { value: 'series-b', label: 'Series B' },
    { value: 'series-c', label: 'Series C+' },
    { value: 'ipo', label: 'Public' },
  ];

  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'san-francisco', label: 'San Francisco' },
    { value: 'new-york', label: 'New York' },
    { value: 'london', label: 'London' },
    { value: 'berlin', label: 'Berlin' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'tel-aviv', label: 'Tel Aviv' },
    { value: 'toronto', label: 'Toronto' },
  ];

  const foundedYears = [
    { value: '', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2015-2019', label: '2015-2019' },
    { value: '2010-2014', label: '2010-2014' },
    { value: 'before-2010', label: 'Before 2010' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    window.location.href = `/search?${queryParams.toString()}`;
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      industry: '',
      location: '',
      fundingStage: '',
      foundedYear: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Startup
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Use our advanced search to discover startups that match your interests, location, and investment criteria
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search startups, founders, or keywords..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2"
              >
                <FilterIcon className="h-4 w-4" />
                <span>Advanced Filters</span>
                <span className={cn(
                  'transform transition-transform duration-200',
                  isExpanded ? 'rotate-180' : ''
                )}>
                  ↓
                </span>
              </Button>
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg animate-slide-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Industry Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Industry
                    </label>
                    <select
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {industries.map((industry) => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {locations.map((location) => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Funding Stage Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <DollarSignIcon className="h-4 w-4 mr-2" />
                      Funding Stage
                    </label>
                    <select
                      value={filters.fundingStage}
                      onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {fundingStages.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Founded Year Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Founded
                    </label>
                    <select
                      value={filters.foundedYear}
                      onChange={(e) => handleFilterChange('foundedYear', e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {foundedYears.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
                  </div>
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Search Startups
                <SearchIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Quick Search Tags */}
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Popular searches:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {['AI Startups', 'YC Companies', 'Unicorns', 'Climate Tech', 'Remote Jobs', 'Crypto'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterChange('query', tag)}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
