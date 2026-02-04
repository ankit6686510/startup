'use client';

import Link from 'next/link';
import { TrendingStartup } from '../types';

interface TrendingStartupsProps {
  startups: TrendingStartup[];
  isLoading?: boolean;
}

const StartupCard = ({ startup }: { startup: TrendingStartup }) => {
  return (
    <Link href={`/startups/${startup.id}`}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {startup.logo || startup.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 line-clamp-2">{startup.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{startup.industry}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{startup.tagline}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Trend Score</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.min(startup.trendScore, 100)}%` }}
                ></div>
              </div>
              <span className="font-medium text-slate-900">{startup.trendScore}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Followers</span>
            <span className="font-medium text-slate-900">{startup.followers.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-600 mb-1">Latest Funding</p>
          <div>
            <p className="font-bold text-slate-900">{startup.fundingRaised}</p>
            <p className="text-xs text-slate-500">{startup.lastFundingRound}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const TrendingCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse"></div>
    </div>
  </div>
);

export function TrendingStartups({ startups, isLoading = false }: TrendingStartupsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Trending Startups</h2>
        <Link href="/startups?sort=trending">
          <p className="text-sm text-blue-600 hover:text-blue-500 font-medium">See All</p>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TrendingCardSkeleton />
          <TrendingCardSkeleton />
          <TrendingCardSkeleton />
        </div>
      ) : startups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">No trending startups available</p>
        </div>
      )}
    </div>
  );
}
