import { Suspense } from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { FeaturedStartups } from '@/features/startups/components/FeaturedStartups';
import { IndustryOverview } from '@/features/home/components/IndustryOverview';
import { StatsSection } from '@/features/home/components/StatsSection';
import { SearchSection } from '@/features/search/components/SearchSection';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Search Section */}
      <Suspense fallback={<Loading />}>
        <SearchSection />
      </Suspense>
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Featured Startups */}
      <Suspense fallback={<Loading />}>
        <FeaturedStartups />
      </Suspense>
      
      {/* Industry Overview */}
      <IndustryOverview />
    </div>
  );
}
