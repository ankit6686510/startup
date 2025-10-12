'use client';

import { 
  ArrowRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  ExternalLinkIcon,
  TrendingUpIcon,
  DollarSignIcon,
  StarIcon,
  HeartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/stores/application';

interface Startup {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  foundedYear: number;
  logo?: string;
  website?: string;
  totalFunding?: string;
  stage: string;
  employeeCount?: number;
  verified: boolean;
  trending: boolean;
  founders: Array<{
    name: string;
    title: string;
    imageUrl?: string;
  }>;
  tags: string[];
}

interface StartupCardProps {
  startup: Startup;
  index: number;
}

export function StartupCard({ startup, index }: StartupCardProps) {
  const favorites = useFavorites();
  const isFavorited = favorites.startups.includes(startup.id);

  const getIndustryBadgeColor = (industry: string) => {
    const colors = {
      'AI & Machine Learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'CleanTech': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'HealthTech': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'EdTech': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Fintech': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      'E-Commerce': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'Mobility': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be implemented when we connect to the store
    console.log('Toggle favorite:', startup.id);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (startup.website) {
      window.open(startup.website, '_blank');
    }
  };

  const handleCardClick = () => {
    window.location.href = `/startups/${startup.slug}`;
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl cursor-pointer animate-slide-in"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={cn(
          'absolute top-4 right-4 p-2 rounded-full transition-all duration-200',
          isFavorited
            ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
        )}
      >
        <HeartIcon className={cn('h-4 w-4', isFavorited && 'fill-current')} />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pr-8">
        <div className="flex items-center space-x-3">
          <img
            src={startup.logo}
            alt={`${startup.name} logo`}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {startup.name}
              </h3>
              {startup.verified && (
                <StarIcon className="h-4 w-4 text-blue-500 fill-current" />
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPinIcon className="h-3 w-3 mr-1" />
              {startup.location}
            </div>
          </div>
        </div>
        {startup.trending && (
          <div className="flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
            <TrendingUpIcon className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Trending
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {startup.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getIndustryBadgeColor(startup.industry))}>
          {startup.industry}
        </span>
        {startup.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {tag}
          </span>
        ))}
        {startup.tags.length > 2 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            +{startup.tags.length - 2}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
            <DollarSignIcon className="h-4 w-4 mr-1" />
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {startup.totalFunding || 'Undisclosed'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {startup.stage}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
            <UsersIcon className="h-4 w-4 mr-1" />
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {startup.employeeCount || 'N/A'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Employees
          </div>
        </div>
      </div>

      {/* Founders */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Founded by:
        </div>
        <div className="space-y-1">
          {startup.founders.slice(0, 2).map((founder, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium mr-2">
                {founder.name.charAt(0)}
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {founder.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                • {founder.title}
              </span>
            </div>
          ))}
          {startup.founders.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{startup.founders.length - 2} more
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Founded {startup.foundedYear}
        </div>
        <div className="flex items-center space-x-2">
          {startup.website && (
            <button
              onClick={handleWebsiteClick}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Visit website"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </button>
          )}
          <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/50 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
    </div>
  );
}
