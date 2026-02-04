import { Suspense } from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { FeaturedStartups } from '@/features/startups/components/FeaturedStartups';
import { IndustryOverview } from '@/features/home/components/IndustryOverview';
import { StatsSection } from '@/features/home/components/StatsSection';
import { SearchSection } from '@/features/search/components/SearchSection';
import { WhyUsSection } from '@/features/home/components/WhyUsSection';
import { TestimonialsSection } from '@/features/home/components/TestimonialsSection';
import { CallToActionSection } from '@/features/home/components/CallToActionSection';
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

      {/* Why Choose Us */}
      <WhyUsSection />

      {/* Industry Overview */}
      <IndustryOverview />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <CallToActionSection />
    </div>
  );
}
