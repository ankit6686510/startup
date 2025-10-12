import { Suspense } from 'react';
import { StartupListingPage } from '@/features/startups/components/StartupListingPage';
import { LoadingPage } from '@/components/ui/loading';

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <StartupListingPage />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Discover Startups | StartupCompass',
  description: 'Explore innovative startups across various industries. Filter by funding stage, location, industry, and more.',
  keywords: 'startups, companies, funding, entrepreneurs, innovation, technology',
  openGraph: {
    title: 'Discover Startups | StartupCompass',
    description: 'Explore innovative startups across various industries',
    type: 'website',
  },
};
