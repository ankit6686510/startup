'use client';

import { 
  ArrowRightIcon,
  MapPinIcon,
  DollarSignIcon,
  TrendingUpIcon,
  StarIcon,
  HeartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CurrentStartup {
  id: string;
  name: string;
  industry: string;
  location: string;
  stage: string;
}

interface SimilarStartup {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  totalFunding: string;
  stage: string;
  logo: string;
  verified: boolean;
  trending: boolean;
  similarityScore: number;
  similarityReasons: string[];
}

interface SimilarStartupsProps {
  currentStartup: CurrentStartup;
}

export function SimilarStartups({ currentStartup }: SimilarStartupsProps) {
  // Mock similar startups data - in real app, this would be fetched from API
  const mockSimilarStartups: SimilarStartup[] = [
    {
      id: '2',
      name: 'DataFlow AI',
      slug: 'dataflow-ai',
      description: 'Enterprise AI platform for automated data processing and real-time analytics.',
      industry: 'AI & Machine Learning',
      location: 'Palo Alto, CA',
      totalFunding: '$8.5M',
      stage: 'Seed',
      logo: 'https://ui-avatars.com/api/?name=DataFlow+AI&background=10b981&color=fff&size=64',
      verified: true,
      trending: false,
      similarityScore: 95,
      similarityReasons: ['Same Industry', 'Similar Funding Stage', 'Bay Area Location']
    },
    {
      id: '3',
      name: 'MindBridge Analytics',
      slug: 'mindbridge-analytics',
      description: 'AI-powered business intelligence platform for enterprise decision making.',
      industry: 'AI & Machine Learning',
      location: 'Seattle, WA',
      totalFunding: '$12.8M',
      stage: 'Series A',
      logo: 'https://ui-avatars.com/api/?name=MindBridge+Analytics&background=8b5cf6&color=fff&size=64',
      verified: true,
      trending: true,
      similarityScore: 88,
      similarityReasons: ['Same Industry', 'Similar Product Focus', 'Similar Funding Stage']
    },
    {
      id: '4',
      name: 'IntelliCore Systems',
      slug: 'intellicore-systems',
      description: 'Advanced machine learning infrastructure for scalable AI applications.',
      industry: 'AI & Machine Learning',
      location: 'Austin, TX',
      totalFunding: '$6.2M',
      stage: 'Seed',
      logo: 'https://ui-avatars.com/api/?name=IntelliCore+Systems&background=f59e0b&color=fff&size=64',
      verified: false,
      trending: false,
      similarityScore: 82,
      similarityReasons: ['Same Industry', 'Similar Technology', 'Similar Team Size']
    },
    {
      id: '5',
      name: 'Cognitive Insights',
      slug: 'cognitive-insights',
      description: 'AI-driven analytics platform helping businesses make smarter decisions.',
      industry: 'AI & Machine Learning',
      location: 'Boston, MA',
      totalFunding: '$4.1M',
      stage: 'Pre-Seed',
      logo: 'https://ui-avatars.com/api/?name=Cognitive+Insights&background=ef4444&color=fff&size=64',
      verified: true,
      trending: false,
      similarityScore: 78,
      similarityReasons: ['Same Industry', 'Similar Mission', 'East Coast Location']
    }
  ];

  const getIndustryBadgeColor = (industry: string) => {
    const colors = {
      'AI & Machine Learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'CleanTech': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'HealthTech': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'EdTech': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Fintech': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleStartupClick = (slug: string) => {
    window.location.href = `/startups/${slug}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent, startupId: string) => {
    e.stopPropagation();
    console.log('Toggle favorite:', startupId);
  };

  return (
    <div className="space-y-6">
      {/* Similar Startups */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Similar Startups
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = `/startups?industry=${encodeURIComponent(currentStartup.industry)}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View All
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {mockSimilarStartups.map((startup) => (
            <div
              key={startup.id}
              className="group cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleStartupClick(startup.slug)}
            >
              <div className="flex items-start space-x-3">
                <img
                  src={startup.logo}
                  alt={`${startup.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {startup.name}
                      </h4>
                      {startup.verified && (
                        <StarIcon className="h-3 w-3 text-blue-500 fill-current" />
                      )}
                      {startup.trending && (
                        <TrendingUpIcon className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                    <button
                      onClick={(e) => handleFavoriteClick(e, startup.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HeartIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {startup.description}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {startup.location.split(',')[0]}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <DollarSignIcon className="h-3 w-3 mr-1" />
                        {startup.totalFunding}
                      </div>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {startup.similarityScore}% match
                    </span>
                  </div>

                  {/* Similarity Reasons */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {startup.similarityReasons.slice(0, 2).map((reason, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {reason}
                      </span>
                    ))}
                    {startup.similarityReasons.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                        +{startup.similarityReasons.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Industry Insights
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getIndustryBadgeColor(currentStartup.industry))}>
                {currentStartup.industry}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Market Overview
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The AI & Machine Learning sector has raised $24.5B across 1,247 deals this year, with enterprise solutions showing the strongest growth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                342
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Similar Companies
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                $8.2M
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg. Funding
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending in Industry */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Trending in {currentStartup.industry}
        </h3>
        
        <div className="space-y-3">
          {[
            { title: 'Enterprise AI adoption rises 40%', trend: '+40%' },
            { title: 'Series A funding increases', trend: '+25%' },
            { title: 'Remote AI talent demand', trend: '+60%' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.title}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {item.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explore More */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">
          Discover More Startups
        </h3>
        <p className="text-blue-100 text-sm mb-4">
          Explore thousands of innovative companies across all industries and stages.
        </p>
        <Button 
          variant="secondary"
          className="w-full bg-white text-blue-600 hover:bg-gray-100"
          onClick={() => window.location.href = '/startups'}
        >
          Browse All Startups
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
