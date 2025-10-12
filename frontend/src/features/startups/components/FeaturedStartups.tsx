'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  ExternalLinkIcon,
  TrendingUpIcon,
  DollarSignIcon,
  StarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingGrid } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface Startup {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  foundedYear: number;
  logo?: string;
  website?: string;
  totalFunding?: string;
  stage: string;
  employeeCount?: number;
  verified: boolean;
  trending: boolean;
  founders: Array<{
    name: string;
    title: string;
    imageUrl?: string;
  }>;
  tags: string[];
}

export function FeaturedStartups() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockStartups: Startup[] = [
    {
      id: '1',
      name: 'NeuralFlow AI',
      slug: 'neuralflow-ai',
      description: 'Revolutionary AI platform that automates complex data analysis and provides real-time insights for enterprise decision making.',
      industry: 'AI & Machine Learning',
      location: 'San Francisco, CA',
      foundedYear: 2023,
      logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
      website: 'https://neuralflow.ai',
      totalFunding: '$15.2M',
      stage: 'Series A',
      employeeCount: 45,
      verified: true,
      trending: true,
      founders: [
        { name: 'Sarah Chen', title: 'CEO & Co-founder' },
        { name: 'Marcus Rodriguez', title: 'CTO & Co-founder' }
      ],
      tags: ['AI', 'Enterprise', 'Analytics', 'B2B']
    },
    {
      id: '2',
      name: 'GreenTech Solutions',
      slug: 'greentech-solutions',
      description: 'Building sustainable energy storage solutions using revolutionary battery technology for renewable energy systems.',
      industry: 'CleanTech',
      location: 'Berlin, Germany',
      foundedYear: 2022,
      logo: 'https://ui-avatars.com/api/?name=GreenTech+Solutions&background=10b981&color=fff&size=128',
      website: 'https://greentechsolutions.com',
      totalFunding: '$22.5M',
      stage: 'Series B',
      employeeCount: 78,
      verified: true,
      trending: false,
      founders: [
        { name: 'Dr. Elena Kowalski', title: 'CEO & Founder' },
        { name: 'James Mitchell', title: 'Head of Engineering' }
      ],
      tags: ['CleanTech', 'Energy', 'Sustainability', 'Hardware']
    },
    {
      id: '3',
      name: 'HealthBridge',
      slug: 'healthbridge',
      description: 'Connecting patients with healthcare providers through AI-powered telemedicine platform with real-time health monitoring.',
      industry: 'HealthTech',
      location: 'London, UK',
      foundedYear: 2024,
      logo: 'https://ui-avatars.com/api/?name=HealthBridge&background=ef4444&color=fff&size=128',
      website: 'https://healthbridge.io',
      totalFunding: '$8.7M',
      stage: 'Seed',
      employeeCount: 28,
      verified: true,
      trending: true,
      founders: [
        { name: 'Dr. Amara Okafor', title: 'CEO & Co-founder' },
        { name: 'Thomas Anderson', title: 'CPO & Co-founder' }
      ],
      tags: ['HealthTech', 'Telemedicine', 'AI', 'SaaS']
    },
    {
      id: '4',
      name: 'EduNext',
      slug: 'edunext',
      description: 'Personalized learning platform that adapts to individual student needs using advanced AI and gamification techniques.',
      industry: 'EdTech',
      location: 'Bangalore, India',
      foundedYear: 2023,
      logo: 'https://ui-avatars.com/api/?name=EduNext&background=f59e0b&color=fff&size=128',
      website: 'https://edunext.com',
      totalFunding: '$12.1M',
      stage: 'Series A',
      employeeCount: 52,
      verified: false,
      trending: true,
      founders: [
        { name: 'Priya Sharma', title: 'CEO & Founder' },
        { name: 'Raj Patel', title: 'CTO & Co-founder' }
      ],
      tags: ['EdTech', 'AI', 'Gamification', 'Mobile']
    },
    {
      id: '5',
      name: 'FinanceFlow',
      slug: 'financeflow',
      description: 'Next-generation payment infrastructure for emerging markets with focus on financial inclusion and micro-transactions.',
      industry: 'Fintech',
      location: 'Singapore',
      foundedYear: 2022,
      logo: 'https://ui-avatars.com/api/?name=FinanceFlow&background=8b5cf6&color=fff&size=128',
      website: 'https://financeflow.sg',
      totalFunding: '$35.8M',
      stage: 'Series B',
      employeeCount: 95,
      verified: true,
      trending: false,
      founders: [
        { name: 'Li Wei Zhang', title: 'CEO & Co-founder' },
        { name: 'Aisha Rahman', title: 'COO & Co-founder' }
      ],
      tags: ['Fintech', 'Payments', 'B2B', 'Infrastructure']
    },
    {
      id: '6',
      name: 'SpaceLogistics',
      slug: 'spacelogistics',
      description: 'Innovative satellite technology for global supply chain tracking and logistics optimization in real-time.',
      industry: 'SpaceTech',
      location: 'Los Angeles, CA',
      foundedYear: 2023,
      logo: 'https://ui-avatars.com/api/?name=SpaceLogistics&background=06b6d4&color=fff&size=128',
      website: 'https://spacelogistics.com',
      totalFunding: '$45.2M',
      stage: 'Series C',
      employeeCount: 120,
      verified: true,
      trending: true,
      founders: [
        { name: 'Alex Turner', title: 'CEO & Founder' },
        { name: 'Dr. Maria Santos', title: 'Chief Scientist' }
      ],
      tags: ['SpaceTech', 'Logistics', 'Satellites', 'B2B']
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchStartups = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStartups(mockStartups);
      } catch (err) {
        setError('Failed to load featured startups');
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const getIndustryBadgeColor = (industry: string) => {
    const colors = {
      'AI & Machine Learning': 'badge-ai',
      'CleanTech': 'badge-cleantech',
      'HealthTech': 'badge-healthtech',
      'EdTech': 'badge-edtech',
      'Fintech': 'badge-fintech',
      'SpaceTech': 'badge-other',
    };
    return colors[industry as keyof typeof colors] || 'badge-other';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Startups
            </h2>
          </div>
          <LoadingGrid count={6} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Startups
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the most innovative startups that are shaping the future across various industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {startups.map((startup, index) => (
            <div
              key={startup.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl cursor-pointer animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => window.location.href = `/startups/${startup.slug}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={startup.logo}
                    alt={`${startup.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {startup.name}
                      </h3>
                      {startup.verified && (
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-blue-500 fill-current" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {startup.location}
                    </p>
                  </div>
                </div>
                {startup.trending && (
                  <div className="flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
                    <TrendingUpIcon className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      Trending
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {startup.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={cn('badge-industry', getIndustryBadgeColor(startup.industry))}>
                  {startup.industry}
                </span>
                {startup.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <DollarSignIcon className="h-4 w-4 mr-1" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {startup.totalFunding || 'Undisclosed'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {startup.stage}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <UsersIcon className="h-4 w-4 mr-1" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {startup.employeeCount || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Employees
                  </div>
                </div>
              </div>

              {/* Founders */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Founded by:
                </div>
                <div className="space-y-1">
                  {startup.founders.slice(0, 2).map((founder, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium mr-2">
                        {founder.name.charAt(0)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {founder.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        • {founder.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Founded {startup.foundedYear}
                </div>
                <div className="flex items-center space-x-2">
                  {startup.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(startup.website, '_blank');
                      }}
                      className="p-2"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3"
            onClick={() => window.location.href = '/startups'}
          >
            View All Startups
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
