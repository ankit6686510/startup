'use client';

import {
  MapPinIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ActivityIcon,
  MoreHorizontalIcon
} from 'lucide-react';

export interface Startup {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  foundedYear: number;
  logo?: string;
  website?: string;
  totalFunding?: string;
  stage: string;
  employeeCount?: number;
  verified: boolean;
  trending: boolean;
  founders: Array<{
    name: string;
    title: string;
    imageUrl?: string;
  }>;
  tags: string[];
}

interface StartupCardProps {
  startup: Startup;
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <div
      className="group bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => window.location.href = `/startups/${startup.slug}`}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <img
              src={startup.logo}
              alt={startup.name}
              className="w-14 h-14 rounded-xl object-cover border border-border shadow-sm"
            />
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                {startup.name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                {startup.location}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {startup.trending && (
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600" title="Trending">
                <TrendingUpIcon className="h-4 w-4" />
              </div>
            )}
            <button className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
          {startup.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-semibold border border-border">
            {startup.industry}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            {startup.stage}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-auto border-t border-border bg-muted/20 rounded-b-xl p-4 grid grid-cols-2 gap-px">
        <div className="px-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Funding</p>
          <p className="text-base font-bold text-foreground font-mono flex items-center">
            <DollarSignIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {startup.totalFunding}
          </p>
        </div>
        <div className="px-2 border-l border-border pl-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Growth Index</p>
          <p className="text-base font-bold text-green-600 font-mono flex items-center">
            <ActivityIcon className="h-3.5 w-3.5 mr-1" />
            High
          </p>
        </div>
      </div>
    </div>
  );
}
