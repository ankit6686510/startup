import { Suspense } from 'react';
import { SearchPage } from '@/features/search/components/SearchPage';
import { LoadingPage } from '@/components/ui/loading';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    industry?: string;
    location?: string;
    page?: string;
  };
}

export default function Search({ searchParams }: SearchPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <SearchPage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const type = searchParams.type || 'all';
  
  const title = query 
    ? `Search results for "${query}" | StartupCompass`
    : 'Search | StartupCompass';
    
  const description = query
    ? `Find startups, founders, and jobs related to "${query}". Discover innovative companies and opportunities.`
    : 'Search for startups, founders, and job opportunities. Discover the next big thing in tech.';

  return {
    title,
    description,
    keywords: 'search, startups, founders, jobs, companies, technology, innovation',
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}
