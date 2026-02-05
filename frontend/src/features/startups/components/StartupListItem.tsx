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
import { cn } from '@/lib/utils';
import { useFavorites } from '@/stores/application';
import { Startup } from '@/features/startups/types';

interface StartupListItemProps {
  startup: Startup;
}

export function StartupListItem({ startup }: StartupListItemProps) {
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
    console.log('Toggle favorite:', startup.id);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (startup.website) {
      window.open(startup.website, '_blank');
    }
  };

  const handleItemClick = () => {
    window.location.href = `/startups/${startup.slug}`;
  };

  const formattedFunding = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(startup.totalFunded || 0);

  const foundedYear = new Date(startup.founded).getFullYear();

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in"
      onClick={handleItemClick}
    >
      <div className="flex items-start space-x-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={startup.logo}
            alt={`${startup.name} logo`}
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {startup.name}
                </h3>
                {startup.verified && (
                  <StarIcon className="h-5 w-5 text-blue-500 fill-current" />
                )}
                {startup.trending && (
                  <div className="flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
                    <TrendingUpIcon className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      Trending
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {startup.location.city}, {startup.location.country}
                <span className="mx-2">•</span>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Founded {foundedYear}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isFavorited
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <HeartIcon className={cn('h-4 w-4', isFavorited && 'fill-current')} />
              </button>
              {startup.website && (
                <button
                  onClick={handleWebsiteClick}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Visit website"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </button>
              )}
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {startup.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getIndustryBadgeColor(startup.industry))}>
              {startup.industry}
            </span>
            {startup.tags?.slice(0, 4).map((tag) => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {tag}
              </span>
            ))}
            {(startup.tags?.length || 0) > 4 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                +{(startup.tags?.length || 0) - 4}
              </span>
            )}
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm">
                <DollarSignIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {formattedFunding}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  • {startup.fundingStage.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {startup.employeeCount || 'N/A'}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  employees
                </span>
              </div>
            </div>

            {/* Founders */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Founded by:</span>
              <div className="flex items-center space-x-1">
                {startup.founders?.slice(0, 3).map((founder, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                    title={`${founder.name} - ${founder.role}`}
                  >
                    {founder.name.charAt(0)}
                  </div>
                ))}
                {(startup.founders?.length || 0) > 3 && (
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                    +{(startup.founders?.length || 0) - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/30 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
}
