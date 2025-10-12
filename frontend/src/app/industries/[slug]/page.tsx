import { Suspense } from 'react';
import { IndustryPage } from '@/features/industries/components/IndustryPage';
import { LoadingPage } from '@/components/ui/loading';

interface IndustryPageProps {
  params: {
    slug: string;
  };
}

export default function Industry({ params }: IndustryPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <IndustryPage industrySlug={params.slug} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: IndustryPageProps) {
  // In a real app, this would fetch industry data
  const industrySlug = params.slug;
  
  // Mock data for metadata generation
  const industryMap: Record<string, { name: string; description: string }> = {
    'ai-machine-learning': {
      name: 'AI & Machine Learning',
      description: 'Discover innovative AI and machine learning startups revolutionizing industries with intelligent automation and data-driven insights.'
    },
    'fintech': {
      name: 'Fintech',
      description: 'Explore cutting-edge fintech startups transforming financial services with digital banking, payments, and investment technologies.'
    },
    'healthtech': {
      name: 'HealthTech',
      description: 'Find healthcare technology startups improving patient outcomes through digital health solutions, telemedicine, and medical devices.'
    },
    'edtech': {
      name: 'EdTech',
      description: 'Browse education technology startups revolutionizing learning through online platforms, AI tutoring, and immersive experiences.'
    },
    'cleantech': {
      name: 'CleanTech',
      description: 'Discover clean technology startups developing sustainable solutions for renewable energy, carbon reduction, and environmental protection.'
    },
    'ecommerce': {
      name: 'E-commerce',
      description: 'Explore e-commerce startups transforming retail through marketplace platforms, social commerce, and direct-to-consumer brands.'
    }
  };

  const industry = industryMap[industrySlug] || { name: 'Industry', description: 'Explore startups in this industry sector.' };

  return {
    title: `${industry.name} Startups | StartupCompass`,
    description: industry.description,
    keywords: `${industry.name.toLowerCase()}, startups, companies, jobs, funding, innovation, technology`,
    openGraph: {
      title: `${industry.name} Startups | StartupCompass`,
      description: industry.description,
      type: 'website',
      images: [
        {
          url: `/images/industries/${industrySlug}-og.jpg`,
          width: 1200,
          height: 630,
          alt: `${industry.name} Startups`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industry.name} Startups | StartupCompass`,
      description: industry.description,
    },
  };
}
