'use client';

import { useState } from 'react';
import { 
  XIcon, 
  SearchIcon, 
  MapPinIcon, 
  DollarSignIcon, 
  CalendarIcon,
  BuildingIcon,
  CheckIcon,
  StarIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
}

export function FilterSidebar({ isOpen, onClose, filters, setFilters }: FilterSidebarProps) {
  const [searchInput, setSearchInput] = useState(filters.q || '');

  const industries = [
    { value: 'ai-ml', label: 'AI & Machine Learning', count: 2847 },
    { value: 'fintech', label: 'Fintech', count: 1923 },
    { value: 'healthtech', label: 'HealthTech', count: 1654 },
    { value: 'edtech', label: 'EdTech', count: 1234 },
    { value: 'cleantech', label: 'CleanTech', count: 987 },
    { value: 'ecommerce', label: 'E-Commerce', count: 1456 },
    { value: 'mobility', label: 'Mobility', count: 743 },
    { value: 'gaming', label: 'Gaming', count: 892 },
    { value: 'blockchain', label: 'Blockchain', count: 654 },
    { value: 'cybersecurity', label: 'Cybersecurity', count: 578 },
  ];

  const locations = [
    { value: 'san-francisco', label: 'San Francisco', count: 3245 },
    { value: 'new-york', label: 'New York', count: 2876 },
    { value: 'london', label: 'London', count: 1654 },
    { value: 'berlin', label: 'Berlin', count: 1234 },
    { value: 'singapore', label: 'Singapore', count: 987 },
    { value: 'bangalore', label: 'Bangalore', count: 1543 },
    { value: 'tel-aviv', label: 'Tel Aviv', count: 765 },
    { value: 'toronto', label: 'Toronto', count: 654 },
    { value: 'sydney', label: 'Sydney', count: 543 },
    { value: 'amsterdam', label: 'Amsterdam', count: 432 },
  ];

  const fundingStages = [
    { value: 'pre-seed', label: 'Pre-Seed', count: 4532 },
    { value: 'seed', label: 'Seed', count: 3245 },
    { value: 'series-a', label: 'Series A', count: 1876 },
    { value: 'series-b', label: 'Series B', count: 987 },
    { value: 'series-c', label: 'Series C', count: 543 },
    { value: 'series-d+', label: 'Series D+', count: 234 },
    { value: 'ipo', label: 'Public', count: 123 },
    { value: 'acquired', label: 'Acquired', count: 876 },
  ];

  const foundedYears = [
    { value: '2024', label: '2024', count: 1234 },
    { value: '2023', label: '2023', count: 2345 },
    { value: '2022', label: '2022', count: 2876 },
    { value: '2021', label: '2021', count: 2654 },
    { value: '2020', label: '2020', count: 2123 },
    { value: '2015-2019', label: '2015-2019', count: 3456 },
    { value: '2010-2014', label: '2010-2014', count: 1876 },
    { value: 'before-2010', label: 'Before 2010', count: 987 },
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees', count: 4532 },
    { value: '11-50', label: '11-50 employees', count: 3245 },
    { value: '51-200', label: '51-200 employees', count: 1876 },
    { value: '201-500', label: '201-500 employees', count: 987 },
    { value: '501-1000', label: '501-1000 employees', count: 543 },
    { value: '1000+', label: '1000+ employees', count: 234 },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: filters[key] === value ? '' : value,
    });
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setFilters({
      ...filters,
      [key]: checked,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      q: searchInput,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
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

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false && value !== 1 && value !== 12 && value !== 'relevance'
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-50 lg:z-auto overflow-y-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        !isOpen && 'lg:hidden'
      )}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear All
                </Button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search startups..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => handleCheckboxChange('verified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <StarIcon className="h-4 w-4 text-blue-500 mr-1" />
                  Verified Only
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.trending || false}
                  onChange={(e) => handleCheckboxChange('trending', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <TrendingUpIcon className="h-4 w-4 text-orange-500 mr-1" />
                  Trending
                </span>
              </label>
            </div>
          </div>

          {/* Industry */}
          <FilterSection
            title="Industry"
            icon={<BuildingIcon className="h-4 w-4" />}
            items={industries}
            selectedValue={filters.industry}
            onSelect={(value) => handleFilterChange('industry', value)}
          />

          {/* Location */}
          <FilterSection
            title="Location"
            icon={<MapPinIcon className="h-4 w-4" />}
            items={locations}
            selectedValue={filters.location}
            onSelect={(value) => handleFilterChange('location', value)}
          />

          {/* Funding Stage */}
          <FilterSection
            title="Funding Stage"
            icon={<DollarSignIcon className="h-4 w-4" />}
            items={fundingStages}
            selectedValue={filters.fundingStage}
            onSelect={(value) => handleFilterChange('fundingStage', value)}
          />

          {/* Founded Year */}
          <FilterSection
            title="Founded"
            icon={<CalendarIcon className="h-4 w-4" />}
            items={foundedYears}
            selectedValue={filters.foundedYear}
            onSelect={(value) => handleFilterChange('foundedYear', value)}
          />

          {/* Company Size */}
          <FilterSection
            title="Company Size"
            icon={<BuildingIcon className="h-4 w-4" />}
            items={companySizes}
            selectedValue={filters.companySize}
            onSelect={(value) => handleFilterChange('companySize', value)}
          />
        </div>
      </div>
    </>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{ value: string; label: string; count: number }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

function FilterSection({ title, icon, items, selectedValue, onSelect }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const displayItems = showAll ? items : items.slice(0, 5);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {icon}
          <span className="ml-2">{title}</span>
        </span>
        <span className={cn(
          'transform transition-transform',
          isExpanded ? 'rotate-90' : ''
        )}>
          →
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {displayItems.map((item) => (
            <label key={item.value} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <div className="relative">
                  <input
                    type="radio"
                    name={title}
                    checked={selectedValue === item.value}
                    onChange={() => onSelect(item.value)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-4 h-4 border-2 rounded border-gray-300 dark:border-gray-600 flex items-center justify-center',
                    selectedValue === item.value && 'border-blue-500 bg-blue-500'
                  )}>
                    {selectedValue === item.value && (
                      <CheckIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {item.label}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.count.toLocaleString()}
              </span>
            </label>
          ))}
          
          {items.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {showAll ? 'Show Less' : `Show ${items.length - 5} More`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
