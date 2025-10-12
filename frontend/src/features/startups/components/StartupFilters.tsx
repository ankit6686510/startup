'use client';

import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StartupFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  activeFiltersCount: number;
}

export function StartupFilters({ filters, setFilters, activeFiltersCount }: StartupFiltersProps) {
  const getFilterDisplayName = (key: string, value: string) => {
    const displayNames = {
      q: `Search: "${value}"`,
      industry: getIndustryName(value),
      location: getLocationName(value),
      fundingStage: getFundingStageDisplayName(value),
      foundedYear: getFoundedYearDisplayName(value),
      companySize: getCompanySizeDisplayName(value),
      verified: 'Verified Only',
      trending: 'Trending',
    };
    return displayNames[key as keyof typeof displayNames] || value;
  };

  const getIndustryName = (value: string) => {
    const industries = {
      'ai-ml': 'AI & Machine Learning',
      'fintech': 'Fintech',
      'healthtech': 'HealthTech',
      'edtech': 'EdTech',
      'cleantech': 'CleanTech',
      'ecommerce': 'E-Commerce',
      'mobility': 'Mobility',
      'gaming': 'Gaming',
      'blockchain': 'Blockchain',
      'cybersecurity': 'Cybersecurity',
    };
    return industries[value as keyof typeof industries] || value;
  };

  const getLocationName = (value: string) => {
    const locations = {
      'san-francisco': 'San Francisco',
      'new-york': 'New York',
      'london': 'London',
      'berlin': 'Berlin',
      'singapore': 'Singapore',
      'bangalore': 'Bangalore',
      'tel-aviv': 'Tel Aviv',
      'toronto': 'Toronto',
      'sydney': 'Sydney',
      'amsterdam': 'Amsterdam',
    };
    return locations[value as keyof typeof locations] || value;
  };

  const getFundingStageDisplayName = (value: string) => {
    const stages = {
      'pre-seed': 'Pre-Seed',
      'seed': 'Seed',
      'series-a': 'Series A',
      'series-b': 'Series B',
      'series-c': 'Series C',
      'series-d+': 'Series D+',
      'ipo': 'Public',
      'acquired': 'Acquired',
    };
    return stages[value as keyof typeof stages] || value;
  };

  const getFoundedYearDisplayName = (value: string) => {
    const years = {
      'before-2010': 'Before 2010',
      '2010-2014': '2010-2014',
      '2015-2019': '2015-2019',
    };
    return years[value as keyof typeof years] || value;
  };

  const getCompanySizeDisplayName = (value: string) => {
    const sizes = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1000+': '1000+ employees',
    };
    return sizes[value as keyof typeof sizes] || value;
  };

  const removeFilter = (key: string) => {
    setFilters({
      ...filters,
      [key]: key === 'verified' || key === 'trending' ? false : '',
    });
  };

  const clearAllFilters = () => {
    setFilters({
      q: '',
      industry: '',
      location: '',
      fundingStage: '',
      foundedYear: '',
      companySize: '',
      verified: false,
      trending: false,
    });
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit' || key === 'sort') return false;
    if (typeof value === 'boolean') return value;
    return value && value !== '';
  });

  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Active Filters ({activeFiltersCount}):
        </span>
        
        {activeFilters.map(([key, value]) => (
          <div
            key={key}
            className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
          >
            <span className="mr-2">
              {getFilterDisplayName(key, value as string)}
            </span>
            <button
              onClick={() => removeFilter(key)}
              className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none focus:bg-blue-200 dark:focus:bg-blue-800 focus:text-blue-800 dark:focus:text-blue-100 transition-colors"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {activeFiltersCount > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
