import { Suspense } from 'react';
import { StartupDetailPage } from '@/features/startups/components/StartupDetailPage';
import { LoadingPage } from '@/components/ui/loading';

interface StartupPageProps {
  params: {
    slug: string;
  };
}

export default function StartupPage({ params }: StartupPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <StartupDetailPage slug={params.slug} />
      </Suspense>
    </div>
  );
}

// This will be used for generating metadata
export async function generateMetadata({ params }: StartupPageProps) {
  // In a real app, you'd fetch the startup data here
  const startupName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${startupName} | StartupCompass`,
    description: `Learn about ${startupName} - company overview, founders, funding, jobs, and latest news.`,
    keywords: 'startup, company, founders, funding, jobs, technology',
    openGraph: {
      title: `${startupName} | StartupCompass`,
      description: `Discover ${startupName} on StartupCompass`,
      type: 'website',
    },
  };
}
