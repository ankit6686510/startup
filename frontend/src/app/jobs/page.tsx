import { Suspense } from 'react';
import { JobsPage } from '@/features/jobs/components/JobsPage';
import { LoadingPage } from '@/components/ui/loading';

interface JobsPageProps {
  searchParams: {
    q?: string;
    type?: string;
    location?: string;
    remote?: string;
    salaryMin?: string;
    salaryMax?: string;
    experience?: string;
    company?: string;
    page?: string;
  };
}

export default function Jobs({ searchParams }: JobsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <JobsPage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ searchParams }: JobsPageProps) {
  const { q, type, location, remote } = searchParams;
  
  let title = 'Jobs at Top Startups | StartupCompass';
  let description = 'Find your next career opportunity at innovative startups. Browse jobs from seed to unicorn companies.';
  
  if (q) {
    title = `${q} Jobs | StartupCompass`;
    description = `Find ${q} jobs at innovative startups. Remote, hybrid, and onsite opportunities available.`;
  }
  
  if (location) {
    title = `Jobs in ${location} | StartupCompass`;
    description = `Find startup jobs in ${location}. Connect with innovative companies and accelerate your career.`;
  }
  
  if (remote === 'true') {
    title = 'Remote Startup Jobs | StartupCompass';
    description = 'Find remote jobs at innovative startups. Work from anywhere while building the future.';
  }

  return {
    title,
    description,
    keywords: 'startup jobs, remote jobs, tech jobs, engineering jobs, product manager, designer jobs',
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/images/jobs-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Startup Jobs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
