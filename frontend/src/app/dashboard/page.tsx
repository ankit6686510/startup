'use client';

import { Suspense } from 'react';
import { useAuth, useRequireAuth } from '@/features/auth/hooks';
import { Loading } from '@/components/ui/loading';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { TrendingStartups } from '@/features/dashboard/components/TrendingStartups';
import { WatchlistSummary } from '@/features/dashboard/components/WatchlistSummary';
import { DashboardNewsSection } from '@/features/dashboard/components/DashboardNews';
import {
  useDashboardData,
  useDashboardStats,
  useRecentActivity,
  useTrendingStartups,
  useWatchlist,
  useDashboardNews
} from '@/features/dashboard/hooks';
import Link from 'next/link';

function DashboardContent() {
  const { user } = useAuth();
  const statsQuery = useDashboardStats();
  const activityQuery = useRecentActivity(5);
  const trendingQuery = useTrendingStartups(6);
  const watchlistQuery = useWatchlist(5);
  const newsQuery = useDashboardNews(6);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Here's what's happening with your StartupCompass today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <StatsGrid
            stats={statsQuery.data || { startupsFollowed: 0, jobsSaved: 0, fundingOpportunities: 0, watchlistItems: 0 }}
            isLoading={statsQuery.isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column - Activity Feed & Trending */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Feed */}
            <ActivityFeed
              activities={activityQuery.data || []}
              isLoading={activityQuery.isLoading}
            />

            {/* Trending Startups */}
            <TrendingStartups
              startups={trendingQuery.data || []}
              isLoading={trendingQuery.isLoading}
            />
          </div>

          {/* Right Column - Watchlist & Quick Links */}
          <div className="space-y-6">
            {/* Watchlist Summary */}
            <WatchlistSummary
              items={watchlistQuery.data || []}
              isLoading={watchlistQuery.isLoading}
            />

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/startups">
                  <div className="px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer font-medium">
                    🚀 Browse Startups
                  </div>
                </Link>
                <Link href="/jobs">
                  <div className="px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer font-medium">
                    💼 Job Board
                  </div>
                </Link>
                <Link href="/startups">
                  <div className="px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer font-medium">
                    💰 Funding Tracker
                  </div>
                </Link>
                <Link href="/startups">
                  <div className="px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer font-medium">
                    📰 Latest News
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="mb-12">
          <DashboardNewsSection
            news={newsQuery.data || []}
            isLoading={newsQuery.isLoading}
          />
        </div>

        {/* Onboarding Reminder (if not completed) */}
        {!user?.onboardingCompleted && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">👋</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Complete Your Profile Setup</h3>
                <p className="text-slate-700 mb-4">
                  Finish setting up your preferences to get personalized recommendations for startups, jobs, and funding opportunities.
                </p>
                <Link href="/onboarding">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Complete Setup →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
