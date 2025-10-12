'use client';

import { 
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  TwitterIcon,
  LinkedinIcon,
  GithubIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyOverviewProps {
  startup: {
    name: string;
    description: string;
    longDescription: string;
    industry: string;
    location: string;
    foundedYear: number;
    employeeCount: number;
    totalFunding: string;
    stage: string;
    website: string;
    tags: string[];
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    metrics: {
      monthlyVisitors?: number;
      downloadCount?: number;
      customerCount?: number;
      revenue?: string;
    };
    coverImage?: string;
  };
}

export function CompanyOverview({ startup }: CompanyOverviewProps) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {startup.coverImage && (
        <div className="relative h-64 rounded-xl overflow-hidden">
          <img
            src={startup.coverImage}
            alt={`${startup.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          About {startup.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
          {startup.longDescription}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIndustryBadgeColor(startup.industry)}`}>
            <BuildingIcon className="h-4 w-4 mr-1" />
            {startup.industry}
          </span>
          {startup.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{startup.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Founded</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{startup.foundedYear}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UsersIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Size</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{startup.employeeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <DollarSignIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Funding</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{startup.totalFunding}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{startup.stage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {startup.metrics.monthlyVisitors && (
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatNumber(startup.metrics.monthlyVisitors)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Visitors</div>
            </div>
          )}
          {startup.metrics.customerCount && (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatNumber(startup.metrics.customerCount)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Customers</div>
            </div>
          )}
          {startup.metrics.revenue && (
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {startup.metrics.revenue}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Annual Revenue</div>
            </div>
          )}
        </div>
      </div>

      {/* Social Links & Website */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Connect</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.open(startup.website, '_blank')}
            className="flex items-center"
          >
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            Website
          </Button>
          
          {startup.socialLinks.twitter && (
            <Button 
              variant="outline" 
              onClick={() => window.open(startup.socialLinks.twitter, '_blank')}
              className="flex items-center"
            >
              <TwitterIcon className="h-4 w-4 mr-2 text-blue-400" />
              Twitter
            </Button>
          )}
          
          {startup.socialLinks.linkedin && (
            <Button 
              variant="outline" 
              onClick={() => window.open(startup.socialLinks.linkedin, '_blank')}
              className="flex items-center"
            >
              <LinkedinIcon className="h-4 w-4 mr-2 text-blue-600" />
              LinkedIn
            </Button>
          )}
          
          {startup.socialLinks.github && (
            <Button 
              variant="outline" 
              onClick={() => window.open(startup.socialLinks.github, '_blank')}
              className="flex items-center"
            >
              <GithubIcon className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
