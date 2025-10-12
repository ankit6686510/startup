'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  ExternalLinkIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  BriefcaseIcon,
  NewspaperIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { useTabState } from '@/hooks/useUrlState';
import { useFavorites } from '@/stores/application';
import { cn } from '@/lib/utils';
import { CompanyOverview } from './detail/CompanyOverview';
import { FounderProfiles } from './detail/FounderProfiles';
import { FundingTimeline } from './detail/FundingTimeline';
import { JobOpenings } from './detail/JobOpenings';
import { NewsUpdates } from './detail/NewsUpdates';
import { SimilarStartups } from './detail/SimilarStartups';
import { ShareBookmark } from './detail/ShareBookmark';

interface StartupDetailPageProps {
  slug: string;
}

interface StartupDetail {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  industry: string;
  location: string;
  foundedYear: number;
  logo: string;
  coverImage?: string;
  website: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  totalFunding: string;
  stage: string;
  employeeCount: number;
  verified: boolean;
  trending: boolean;
  tags: string[];
  founders: Array<{
    id: string;
    name: string;
    title: string;
    bio: string;
    imageUrl: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }>;
  fundingRounds: Array<{
    id: string;
    round: string;
    amount: string;
    date: string;
    investors: string[];
    leadInvestor?: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    remote: boolean;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    postedDate: string;
    description: string;
  }>;
  news: Array<{
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedDate: string;
    imageUrl?: string;
  }>;
  metrics: {
    monthlyVisitors?: number;
    downloadCount?: number;
    customerCount?: number;
    revenue?: string;
  };
}

export function StartupDetailPage({ slug }: StartupDetailPageProps) {
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeTab, setTab } = useTabState('overview');
  const favorites = useFavorites();

  // Mock data - in real app, this would be fetched from API
  const mockStartup: StartupDetail = {
    id: '1',
    name: 'NeuralFlow AI',
    slug: 'neuralflow-ai',
    tagline: 'Intelligent automation for the modern enterprise',
    description: 'Revolutionary AI platform that automates complex data analysis and provides real-time insights for enterprise decision making.',
    longDescription: 'NeuralFlow AI is pioneering the next generation of artificial intelligence solutions for enterprise environments. Our platform combines advanced machine learning algorithms with intuitive user interfaces to help businesses make data-driven decisions faster than ever before. We specialize in automated data analysis, predictive analytics, and real-time business intelligence that scales with your organization. Our mission is to democratize AI and make sophisticated data analysis accessible to businesses of all sizes.',
    industry: 'AI & Machine Learning',
    location: 'San Francisco, CA',
    foundedYear: 2023,
    logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    website: 'https://neuralflow.ai',
    socialLinks: {
      twitter: 'https://twitter.com/neuralflowai',
      linkedin: 'https://linkedin.com/company/neuralflow-ai',
      github: 'https://github.com/neuralflow'
    },
    totalFunding: '$15.2M',
    stage: 'Series A',
    employeeCount: 45,
    verified: true,
    trending: true,
    tags: ['AI', 'Enterprise', 'Analytics', 'B2B', 'SaaS', 'Machine Learning'],
    founders: [
      {
        id: '1',
        name: 'Sarah Chen',
        title: 'CEO & Co-founder',
        bio: 'Former VP of AI at Google, Stanford PhD in Computer Science. 10+ years building AI systems at scale. Passionate about democratizing AI for business.',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b78b1aec?w=150&h=150&fit=crop&crop=face',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        twitterUrl: 'https://twitter.com/sarahchen'
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        title: 'CTO & Co-founder',
        bio: 'Previously Principal Engineer at Netflix, MIT graduate. Expert in distributed systems and machine learning infrastructure. Loves solving complex technical challenges.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
        twitterUrl: 'https://twitter.com/marcusrodriguez'
      }
    ],
    fundingRounds: [
      {
        id: '1',
        round: 'Series A',
        amount: '$12M',
        date: '2024-03-15',
        investors: ['Andreessen Horowitz', 'Sequoia Capital', 'Y Combinator'],
        leadInvestor: 'Andreessen Horowitz'
      },
      {
        id: '2',
        round: 'Seed',
        amount: '$2.5M',
        date: '2023-08-10',
        investors: ['Y Combinator', 'Founder Collective', 'Several Angel Investors'],
        leadInvestor: 'Y Combinator'
      },
      {
        id: '3',
        round: 'Pre-Seed',
        amount: '$750K',
        date: '2023-02-20',
        investors: ['Friends & Family', 'Angel Investors'],
        leadInvestor: 'Angel Investors'
      }
    ],
    jobs: [
      {
        id: '1',
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        salary: { min: 140000, max: 180000, currency: 'USD' },
        postedDate: '2024-10-01',
        description: 'Join our frontend team to build beautiful, responsive user interfaces for our AI platform.'
      },
      {
        id: '2',
        title: 'Machine Learning Engineer',
        department: 'AI Research',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: false,
        salary: { min: 160000, max: 220000, currency: 'USD' },
        postedDate: '2024-09-28',
        description: 'Work on cutting-edge ML models and algorithms to power our AI platform.'
      },
      {
        id: '3',
        title: 'Product Marketing Manager',
        department: 'Marketing',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        salary: { min: 120000, max: 150000, currency: 'USD' },
        postedDate: '2024-09-25',
        description: 'Drive product marketing strategy and go-to-market initiatives.'
      }
    ],
    news: [
      {
        id: '1',
        title: 'NeuralFlow AI Raises $12M Series A to Democratize Enterprise AI',
        summary: 'The company plans to use the funding to expand its team and enhance its AI platform capabilities.',
        url: 'https://techcrunch.com/neuralflow-series-a',
        source: 'TechCrunch',
        publishedDate: '2024-03-15',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
      },
      {
        id: '2',
        title: 'How NeuralFlow AI is Transforming Enterprise Decision Making',
        summary: 'A deep dive into the company\'s AI platform and its impact on business intelligence.',
        url: 'https://forbes.com/neuralflow-enterprise-ai',
        source: 'Forbes',
        publishedDate: '2024-02-28',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
      },
      {
        id: '3',
        title: 'NeuralFlow AI Wins Best AI Startup at TechCrunch Disrupt',
        summary: 'The company was recognized for its innovative approach to enterprise AI solutions.',
        url: 'https://techcrunch.com/disrupt-2024-winners',
        source: 'TechCrunch',
        publishedDate: '2024-01-20',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop'
      }
    ],
    metrics: {
      monthlyVisitors: 150000,
      customerCount: 250,
      revenue: '$2.5M ARR'
    }
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      if (slug === 'neuralflow-ai') {
        setStartup(mockStartup);
      } else {
        setError('Startup not found');
      }
      setLoading(false);
    }, 1000);
  }, [slug]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Startup Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The startup you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/startups'}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>
        </div>
      </div>
    );
  }

  const isFavorited = favorites.startups.includes(startup.id);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <StarIcon className="h-4 w-4" /> },
    { id: 'founders', label: 'Founders', icon: <UsersIcon className="h-4 w-4" /> },
    { id: 'funding', label: 'Funding', icon: <TrendingUpIcon className="h-4 w-4" /> },
    { id: 'jobs', label: 'Jobs', icon: <BriefcaseIcon className="h-4 w-4" />, count: startup.jobs.length },
    { id: 'news', label: 'News', icon: <NewspaperIcon className="h-4 w-4" />, count: startup.news.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <button 
              onClick={() => window.location.href = '/startups'}
              className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              All Startups
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{startup.name}</span>
          </div>

          {/* Company Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <img
                src={startup.logo}
                alt={`${startup.name} logo`}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {startup.name}
                  </h1>
                  {startup.verified && (
                    <StarIcon className="h-6 w-6 text-blue-500 fill-current" />
                  )}
                  {startup.trending && (
                    <div className="flex items-center px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
                      <TrendingUpIcon className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-1" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Trending
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                  {startup.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {startup.location}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Founded {startup.foundedYear}
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    {startup.employeeCount} employees
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <ShareBookmark startup={startup} isFavorited={isFavorited} />
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                  {tab.count && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && <CompanyOverview startup={startup} />}
            {activeTab === 'founders' && <FounderProfiles founders={startup.founders} />}
            {activeTab === 'funding' && <FundingTimeline fundingRounds={startup.fundingRounds} />}
            {activeTab === 'jobs' && <JobOpenings jobs={startup.jobs} companyName={startup.name} />}
            {activeTab === 'news' && <NewsUpdates news={startup.news} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SimilarStartups currentStartup={startup} />
          </div>
        </div>
      </div>
    </div>
  );
}
