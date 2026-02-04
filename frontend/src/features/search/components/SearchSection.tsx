'use client';

import { useState } from 'react';
import { SearchIcon, FilterIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SearchSection() {
  const [filters, setFilters] = useState({
    query: '',
    industry: '',
    location: '',
    fundingStage: '',
    foundedYear: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const industries = ['AI & Machine Learning', 'Fintech', 'HealthTech', 'EdTech', 'CleanTech', 'E-Commerce', 'Mobility', 'Gaming'];
  const locations = ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Bangalore', 'Tel Aviv', 'Toronto'];
  const stages = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    window.location.href = `/search?${queryParams.toString()}`;
  };

  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Advanced Screening
            </h2>
            <p className="text-lg text-muted-foreground">
              Filter 12,000+ companies by multiple data points including funding history, team size, and growth metrics.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-1 bg-muted/50 border-b border-border flex overflow-x-auto gap-1">
            {['All', 'Trending', 'Newest', 'Highest Funded', 'Top Rated'].map((tab, i) => (
              <button
                key={tab}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                  i === 0
                    ? "bg-card text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by company name, founder, or investor..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Industry</label>
                  <select
                    className="w-full p-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">Any Industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</label>
                  <select
                    className="w-full p-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="">Any Location</option>
                    {locations.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</label>
                  <select
                    className="w-full p-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    onChange={(e) => setFilters(prev => ({ ...prev, fundingStage: e.target.value }))}
                  >
                    <option value="">Any Stage</option>
                    {stages.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setFilters({ query: '', industry: '', location: '', fundingStage: '', foundedYear: '' })}
                >
                  Reset Filters
                </Button>
                <div className="flex-1" />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                >
                  View Results
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
