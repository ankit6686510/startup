'use client';

import Link from 'next/link';
import { WatchlistItem } from '../types';

interface WatchlistSummaryProps {
  items: WatchlistItem[];
  isLoading?: boolean;
}

const typeIcons: Record<string, string> = {
  startup: '🚀',
  job: '💼',
  funding: '💰'
};

const typeLabels: Record<string, string> = {
  startup: 'Startup',
  job: 'Job',
  funding: 'Funding'
};

const WatchlistItemComponent = ({ item }: { item: WatchlistItem }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-xl flex-shrink-0">{typeIcons[item.type]}</div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
            <p className="text-sm text-slate-600 line-clamp-1">{item.description}</p>
            <p className="text-xs text-slate-500 mt-1">
              Added {new Date(item.addedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {item.status && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${statusColors[item.status] || 'bg-slate-100 text-slate-700'}`}>
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
};

const WatchlistItemSkeleton = () => (
  <div className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
    <div className="flex gap-3">
      <div className="w-6 h-6 bg-slate-200 rounded flex-shrink-0 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export function WatchlistSummary({ items, isLoading = false }: WatchlistSummaryProps) {
  const itemCounts = {
    startup: items.filter(i => i.type === 'startup').length,
    job: items.filter(i => i.type === 'job').length,
    funding: items.filter(i => i.type === 'funding').length
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Watchlist</h2>
        <Link href="/dashboard">
          <p className="text-sm text-blue-600 hover:text-blue-500 font-medium">View All</p>
        </Link>
      </div>

      {/* Watchlist Type Summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Link href="/dashboard?type=startup">
          <div className="bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition cursor-pointer">
            <p className="text-2xl font-bold text-blue-600">{itemCounts.startup}</p>
            <p className="text-xs text-slate-600 mt-1">Startups</p>
          </div>
        </Link>
        <Link href="/dashboard?type=job">
          <div className="bg-green-50 rounded-lg p-3 text-center hover:bg-green-100 transition cursor-pointer">
            <p className="text-2xl font-bold text-green-600">{itemCounts.job}</p>
            <p className="text-xs text-slate-600 mt-1">Jobs</p>
          </div>
        </Link>
        <Link href="/dashboard?type=funding">
          <div className="bg-purple-50 rounded-lg p-3 text-center hover:bg-purple-100 transition cursor-pointer">
            <p className="text-2xl font-bold text-purple-600">{itemCounts.funding}</p>
            <p className="text-xs text-slate-600 mt-1">Funding</p>
          </div>
        </Link>
      </div>

      {/* Watchlist Items */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <WatchlistItemSkeleton />
            <WatchlistItemSkeleton />
            <WatchlistItemSkeleton />
          </>
        ) : items.length > 0 ? (
          items.map((item) => (
            <WatchlistItemComponent key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">No watchlist items yet</p>
            <p className="text-sm text-slate-500 mt-2">Start adding startups and jobs to your watchlist</p>
          </div>
        )}
      </div>
    </div>
  );
}
