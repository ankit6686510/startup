'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { startupsAPI } from '@/features/startups/api';
import { StartupComparison } from '@/features/startups/components/StartupComparison';

export default function ComparisonResultPage() {
  const { ids } = useParams();
  const startupIds = typeof ids === 'string' ? ids.split(',') : [];

  const { data: comparisonData, isLoading, error } = useQuery({
    queryKey: ['compare-startups', startupIds],
    queryFn: async () => {
      return startupsAPI.compareStartups(startupIds);
    },
    enabled: startupIds.length >= 2,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Error loading comparison</h1>
          <p className="text-slate-600 mb-4">Something went wrong. Please try again.</p>
          <Link href="/startups/compare" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to comparison tool
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !comparisonData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
            <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <Link href="/startups/compare" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← New comparison
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {comparisonData.startups.length} Startup Comparison
          </h1>
          <p className="text-slate-600 mt-1">Side-by-side comparison of key metrics</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <StartupComparison startups={comparisonData.startups} />

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href="/startups/compare"
            className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            ← Compare Different Startups
          </Link>
          <Link
            href="/startups"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse More Startups →
          </Link>
        </div>
      </div>
    </div>
  );
}
