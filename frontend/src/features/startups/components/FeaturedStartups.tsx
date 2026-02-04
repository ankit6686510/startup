

'use client';

import {
  ArrowRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingGrid } from '@/components/ui/loading';
import { StartupCard } from './StartupCard';
import { useQuery } from '@tanstack/react-query';
import { StartupService } from '@/services/startups';

export function FeaturedStartups() {
  const { data: startups, isLoading, isError } = useQuery({
    queryKey: ['featuredStartups'],
    queryFn: StartupService.getFeatured,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingGrid count={6} />
        </div>
      </section>
    );
  }

  if (isError || !startups) return null;

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Market Movers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              High-growth companies attracting significant attention this week.
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 border-border hover:bg-card hover:border-foreground/20 transition-all font-medium px-6 text-foreground"
            onClick={() => window.location.href = '/startups'}
          >
            View All Startups
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button
            variant="outline"
            className="w-full justify-center border-border text-foreground"
            onClick={() => window.location.href = '/startups'}
          >
            View All Startups
          </Button>
        </div>
      </div>
    </section>
  );
}

// ... (keep interface definitions) ...
