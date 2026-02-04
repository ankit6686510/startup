'use client';

import { DashboardStats } from '../types';

interface StatsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const StatCard = ({ 
  label, 
  value, 
  icon, 
  color = 'blue',
  isLoading = false 
}: { 
  label: string; 
  value: number | string; 
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  isLoading?: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} rounded-full w-16 h-16 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export function StatsGrid({ stats, isLoading = false }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Startups Followed"
        value={stats.startupsFollowed}
        icon="🚀"
        color="blue"
        isLoading={isLoading}
      />
      <StatCard
        label="Jobs Saved"
        value={stats.jobsSaved}
        icon="💼"
        color="green"
        isLoading={isLoading}
      />
      <StatCard
        label="Funding Opportunities"
        value={stats.fundingOpportunities}
        icon="💰"
        color="purple"
        isLoading={isLoading}
      />
      <StatCard
        label="Watchlist Items"
        value={stats.watchlistItems}
        icon="⭐"
        color="orange"
        isLoading={isLoading}
      />
    </div>
  );
}
