'use client';

import Link from 'next/link';
import { Startup, FundingStage } from '../types';

const fundingStageColors: Record<FundingStage, string> = {
  IDEA: 'bg-red-100 text-red-800',
  SEED: 'bg-yellow-100 text-yellow-800',
  SERIES_A: 'bg-blue-100 text-blue-800',
  SERIES_B: 'bg-indigo-100 text-indigo-800',
  SERIES_C: 'bg-purple-100 text-purple-800',
  SERIES_D: 'bg-pink-100 text-pink-800',
  SERIES_E: 'bg-rose-100 text-rose-800',
  GROWTH: 'bg-green-100 text-green-800',
  LATE_STAGE: 'bg-emerald-100 text-emerald-800',
  PUBLIC: 'bg-slate-100 text-slate-800',
};

interface StartupCardProps {
  startup: Startup;
  variant?: 'list' | 'grid';
}

export function StartupCard({ startup, variant = 'grid' }: StartupCardProps) {
  const formattedFunding = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(startup.totalFunded);

  const fundingStageLabel = (startup.fundingStage || 'UNKNOWN').replace(/_/g, ' ');
  const colorClass = fundingStageColors[startup.fundingStage] || 'bg-slate-100 text-slate-800';

  if (variant === 'list') {
    return (
      <Link href={`/startups/${startup.id}`}>
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer">
          <div className="flex items-start gap-4">
            {startup.logo && (
              <img
                src={startup.logo}
                alt={startup.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{startup.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-1">{startup.tagline}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title={startup.isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {startup.isSaved ? '⭐' : '☆'}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${colorClass}`}>
                  {fundingStageLabel}
                </span>
                <span className="text-sm text-slate-600">📍 {startup.location.city}</span>
                <span className="text-sm text-slate-600">💰 {formattedFunding}</span>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-slate-600">
                  👥 {startup.followersCount.toLocaleString()} followers
                </span>
                <span className="text-slate-600">🏢 {startup.industry}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/startups/${startup.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer group">
        {startup.logo && (
          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
            <img
              src={startup.logo}
              alt={startup.name}
              className="w-24 h-24 object-contain group-hover:scale-110 transition"
            />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-bold text-slate-900 line-clamp-1">{startup.name}</h3>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{startup.tagline}</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-1 rounded ${colorClass}`}>
                {fundingStageLabel}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                {startup.isSaved ? '⭐' : '☆'}
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>📍 {startup.location.city}</p>
              <p>💰 {formattedFunding} raised</p>
              <p>👥 {startup.followersCount.toLocaleString()} followers</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function StartupCardSkeleton({ variant = 'grid' }: { variant?: 'list' | 'grid' }) {
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
