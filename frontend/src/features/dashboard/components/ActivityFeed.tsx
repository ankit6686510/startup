'use client';

import Link from 'next/link';
import { Activity } from '../types';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const iconMap: Record<string, string> = {
    startup_followed: '🚀',
    job_saved: '💼',
    article_read: '📰',
    funding_update: '💰'
  };

  const typeLabels: Record<string, string> = {
    startup_followed: 'Startup Followed',
    job_saved: 'Job Saved',
    article_read: 'Article Read',
    funding_update: 'Funding Update'
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const badgeColors = {
      startup_followed: 'bg-blue-100 text-blue-700',
      job_saved: 'bg-green-100 text-green-700',
      article_read: 'bg-orange-100 text-orange-700',
      funding_update: 'bg-purple-100 text-purple-700'
    };

    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColors[type as keyof typeof badgeColors] || 'bg-slate-100'}`}>
        {typeLabels[type]}
      </span>
    );
  };

  const content = (
    <div className="p-4 hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 last:border-b-0">
      <div className="flex gap-3">
        <div className="text-2xl flex-shrink-0">{iconMap[activity.type]}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-slate-900">{activity.title}</h4>
            <TypeBadge type={activity.type} />
          </div>
          <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
          <p className="text-xs text-slate-500">
            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );

  if (activity.actionUrl) {
    return (
      <Link href={activity.actionUrl as any}>
        {content}
      </Link>
    );
  }

  return content;
};

const ActivitySkeleton = () => (
  <div className="p-4 border-b border-slate-100">
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          <>
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-600">No recent activity yet</p>
            <p className="text-sm text-slate-500 mt-2">Start exploring startups and saving items!</p>
          </div>
        )}
      </div>
    </div>
  );
}
