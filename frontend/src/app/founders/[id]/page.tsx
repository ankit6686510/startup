import { Suspense } from 'react';
import { FounderProfilePage } from '@/features/founders/components/FounderProfilePage';
import { LoadingPage } from '@/components/ui/loading';

interface FounderPageProps {
  params: {
    id: string;
  };
}

export default function FounderPage({ params }: FounderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingPage />}>
        <FounderProfilePage founderId={params.id} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: FounderPageProps) {
  // In a real app, this would fetch founder data
  const founderId = params.id;
  
  // Mock data for metadata generation
  const founderName = founderId === 'sarah-chen' ? 'Sarah Chen' : 'Founder Profile';
  const founderTitle = founderId === 'sarah-chen' ? 'CEO & Co-founder at NeuralFlow AI' : 'Entrepreneur';
  const founderBio = founderId === 'sarah-chen' 
    ? 'Former VP of AI at Google, Stanford PhD in Computer Science. Building the future of AI.'
    : 'Experienced entrepreneur and technology leader.';

  return {
    title: `${founderName} - ${founderTitle} | StartupCompass`,
    description: founderBio,
    keywords: 'founder, entrepreneur, startup, technology, AI, machine learning',
    openGraph: {
      title: `${founderName} - ${founderTitle}`,
      description: founderBio,
      type: 'profile',
      images: [
        {
          url: '/images/founder-og.jpg',
          width: 1200,
          height: 630,
          alt: founderName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${founderName} - ${founderTitle}`,
      description: founderBio,
    },
  };
}
