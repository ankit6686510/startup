'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftIcon,
  TrendingUpIcon,
  BuildingIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  ChevronRightIcon,
  BarChart3Icon,
  Target,
  Zap,
  Rocket,
  Globe,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface IndustryPageProps {
  industrySlug: string;
}

interface IndustryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  gradient: string;
  heroImage: string;
  
  statistics: {
    totalStartups: number;
    totalFunding: string;
    averageFunding: string;
    jobOpenings: number;
    growthRate: string;
    topFundingYear: number;
    marketSize: string;
    avgValuation: string;
  };
  
  keyMetrics: Array<{
    label: string;
    value: string;
    change: string;
    positive: boolean;
  }>;
  
  trendingTechnologies: Array<{
    id: string;
    name: string;
    description: string;
    adoptionRate: number;
    growthRate: string;
    category: string;
    startupCount: number;
  }>;
  
  topCompanies: Array<{
    id: string;
    name: string;
    description: string;
    logo: string;
    valuation: string;
    fundingStage: string;
    foundedYear: number;
    employees: string;
    headquarters: string;
    trending: boolean;
    featured: boolean;
  }>;
  
  recentNews: Array<{
    id: string;
    title: string;
    summary: string;
    date: string;
    source: string;
    category: 'funding' | 'acquisition' | 'product' | 'partnership';
  }>;
  
  insights: Array<{
    id: string;
    title: string;
    description: string;
    trend: 'up' | 'down' | 'stable';
    impact: 'high' | 'medium' | 'low';
  }>;
}

export function IndustryPage({ industrySlug }: IndustryPageProps) {
  const [industry, setIndustry] = useState<IndustryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('valuation');

  // Mock industry data
  const mockIndustries: Record<string, IndustryData> = {
    'ai-machine-learning': {
      id: '1',
      name: 'AI & Machine Learning',
      slug: 'ai-machine-learning',
      description: 'Artificial Intelligence and Machine Learning startups revolutionizing industries through intelligent automation and data-driven insights.',
      longDescription: 'The AI & Machine Learning industry represents one of the most transformative sectors in modern technology. These startups are developing cutting-edge solutions that automate complex processes, enhance decision-making capabilities, and create entirely new possibilities across healthcare, finance, transportation, and countless other domains. From neural networks and deep learning algorithms to natural language processing and computer vision, AI startups are pushing the boundaries of what machines can achieve.',
      icon: '🤖',
      color: 'blue',
      gradient: 'from-blue-500 to-purple-600',
      heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
      
      statistics: {
        totalStartups: 2847,
        totalFunding: '$127.3B',
        averageFunding: '$44.7M',
        jobOpenings: 15420,
        growthRate: '+23.4%',
        topFundingYear: 2023,
        marketSize: '$390.9B',
        avgValuation: '$89.2M'
      },
      
      keyMetrics: [
        { label: 'Quarterly Growth', value: '+18.2%', change: '+2.1%', positive: true },
        { label: 'New Startups', value: '342', change: '+12.4%', positive: true },
        { label: 'Exit Rate', value: '8.7%', change: '+1.2%', positive: true },
        { label: 'Success Rate', value: '24.1%', change: '-0.8%', positive: false }
      ],
      
      trendingTechnologies: [
        {
          id: '1',
          name: 'Large Language Models (LLMs)',
          description: 'Advanced AI models capable of understanding and generating human-like text',
          adoptionRate: 78,
          growthRate: '+156%',
          category: 'Natural Language Processing',
          startupCount: 423
        },
        {
          id: '2',
          name: 'Computer Vision',
          description: 'AI systems that can interpret and understand visual information',
          adoptionRate: 65,
          growthRate: '+89%',
          category: 'Computer Vision',
          startupCount: 318
        },
        {
          id: '3',
          name: 'Reinforcement Learning',
          description: 'ML algorithms that learn through interaction with environments',
          adoptionRate: 52,
          growthRate: '+134%',
          category: 'Machine Learning',
          startupCount: 267
        },
        {
          id: '4',
          name: 'Edge AI',
          description: 'AI processing directly on edge devices without cloud connectivity',
          adoptionRate: 43,
          growthRate: '+201%',
          category: 'Infrastructure',
          startupCount: 189
        }
      ],
      
      topCompanies: [
        {
          id: '1',
          name: 'OpenAI',
          description: 'Leading AI research lab developing safe and beneficial artificial general intelligence',
          logo: 'https://ui-avatars.com/api/?name=OpenAI&background=000000&color=fff&size=128',
          valuation: '$86B',
          fundingStage: 'Private',
          foundedYear: 2015,
          employees: '1,000+',
          headquarters: 'San Francisco, CA',
          trending: true,
          featured: true
        },
        {
          id: '2',
          name: 'Anthropic',
          description: 'AI safety startup developing reliable, interpretable, and steerable AI systems',
          logo: 'https://ui-avatars.com/api/?name=Anthropic&background=2563eb&color=fff&size=128',
          valuation: '$15B',
          fundingStage: 'Series C',
          foundedYear: 2021,
          employees: '500+',
          headquarters: 'San Francisco, CA',
          trending: true,
          featured: true
        },
        {
          id: '3',
          name: 'Stability AI',
          description: 'Open-source AI company building generative AI models for images, language, and more',
          logo: 'https://ui-avatars.com/api/?name=Stability+AI&background=8b5cf6&color=fff&size=128',
          valuation: '$4B',
          fundingStage: 'Series A',
          foundedYear: 2020,
          employees: '200+',
          headquarters: 'London, UK',
          trending: false,
          featured: true
        },
        {
          id: '4',
          name: 'Scale AI',
          description: 'Data platform company helping enterprises accelerate AI development',
          logo: 'https://ui-avatars.com/api/?name=Scale+AI&background=059669&color=fff&size=128',
          valuation: '$7.3B',
          fundingStage: 'Series E',
          foundedYear: 2016,
          employees: '800+',
          headquarters: 'San Francisco, CA',
          trending: false,
          featured: false
        },
        {
          id: '5',
          name: 'Cohere',
          description: 'AI platform providing large language models for enterprise applications',
          logo: 'https://ui-avatars.com/api/?name=Cohere&background=f59e0b&color=fff&size=128',
          valuation: '$2.2B',
          fundingStage: 'Series C',
          foundedYear: 2019,
          employees: '300+',
          headquarters: 'Toronto, Canada',
          trending: true,
          featured: false
        }
      ],
      
      recentNews: [
        {
          id: '1',
          title: 'OpenAI raises $6.6B in Series C funding round',
          summary: 'OpenAI completed one of the largest funding rounds in startup history, reaching $86B valuation.',
          date: '2024-01-15',
          source: 'TechCrunch',
          category: 'funding'
        },
        {
          id: '2',
          title: 'Anthropic partners with Google Cloud for enterprise AI',
          summary: 'Strategic partnership to deliver Claude AI models through Google Cloud infrastructure.',
          date: '2024-01-12',
          source: 'VentureBeat',
          category: 'partnership'
        },
        {
          id: '3',
          title: 'Scale AI launches new computer vision platform',
          summary: 'Comprehensive platform for training and deploying computer vision models at enterprise scale.',
          date: '2024-01-10',
          source: 'AI News',
          category: 'product'
        }
      ],
      
      insights: [
        {
          id: '1',
          title: 'Enterprise AI Adoption Accelerating',
          description: 'Large enterprises are rapidly adopting AI solutions, driving significant market growth.',
          trend: 'up',
          impact: 'high'
        },
        {
          id: '2',
          title: 'Open Source AI Models Gaining Traction',
          description: 'Companies are increasingly choosing open-source alternatives to proprietary AI models.',
          trend: 'up',
          impact: 'medium'
        },
        {
          id: '3',
          title: 'AI Regulation Framework Emerging',
          description: 'Government regulations are beginning to shape the AI development landscape.',
          trend: 'stable',
          impact: 'high'
        }
      ]
    },
    
    'fintech': {
      id: '2',
      name: 'Fintech',
      slug: 'fintech',
      description: 'Financial technology startups revolutionizing banking, payments, investing, and financial services.',
      longDescription: 'The Fintech industry is transforming traditional financial services through innovative technology solutions. These startups are democratizing access to financial tools, creating more efficient payment systems, revolutionizing lending and investing, and building the infrastructure for the digital economy. From digital banking and cryptocurrency to robo-advisors and blockchain-based solutions, fintech companies are making financial services more accessible, affordable, and user-friendly.',
      icon: '💳',
      color: 'green',
      gradient: 'from-green-500 to-blue-600',
      heroImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=400&fit=crop',
      
      statistics: {
        totalStartups: 4231,
        totalFunding: '$238.7B',
        averageFunding: '$56.4M',
        jobOpenings: 23850,
        growthRate: '+31.7%',
        topFundingYear: 2023,
        marketSize: '$698.4B',
        avgValuation: '$124.8M'
      },
      
      keyMetrics: [
        { label: 'Transaction Volume', value: '+42.1%', change: '+5.3%', positive: true },
        { label: 'User Adoption', value: '89.2M', change: '+28.7%', positive: true },
        { label: 'Digital Payments', value: '+67.4%', change: '+8.9%', positive: true },
        { label: 'Regulatory Clarity', value: '72%', change: '+12.1%', positive: true }
      ],
      
      trendingTechnologies: [
        {
          id: '1',
          name: 'Embedded Finance',
          description: 'Integration of financial services into non-financial platforms',
          adoptionRate: 84,
          growthRate: '+189%',
          category: 'Infrastructure',
          startupCount: 567
        },
        {
          id: '2',
          name: 'Buy Now, Pay Later (BNPL)',
          description: 'Alternative credit solutions for consumer purchases',
          adoptionRate: 76,
          growthRate: '+145%',
          category: 'Payments',
          startupCount: 432
        },
        {
          id: '3',
          name: 'Decentralized Finance (DeFi)',
          description: 'Blockchain-based financial services without traditional intermediaries',
          adoptionRate: 58,
          growthRate: '+234%',
          category: 'Blockchain',
          startupCount: 389
        },
        {
          id: '4',
          name: 'Regtech',
          description: 'Technology solutions for regulatory compliance and risk management',
          adoptionRate: 63,
          growthRate: '+98%',
          category: 'Compliance',
          startupCount: 298
        }
      ],
      
      topCompanies: [
        {
          id: '1',
          name: 'Stripe',
          description: 'Payment processing platform for online businesses and marketplaces',
          logo: 'https://ui-avatars.com/api/?name=Stripe&background=635bff&color=fff&size=128',
          valuation: '$95B',
          fundingStage: 'Private',
          foundedYear: 2010,
          employees: '4,000+',
          headquarters: 'San Francisco, CA',
          trending: true,
          featured: true
        },
        {
          id: '2',
          name: 'Klarna',
          description: 'Buy now, pay later and digital banking services platform',
          logo: 'https://ui-avatars.com/api/?name=Klarna&background=ffb3d9&color=000&size=128',
          valuation: '$6.7B',
          fundingStage: 'Private',
          foundedYear: 2005,
          employees: '5,000+',
          headquarters: 'Stockholm, Sweden',
          trending: true,
          featured: true
        },
        {
          id: '3',
          name: 'Plaid',
          description: 'Financial data connectivity platform enabling fintech innovation',
          logo: 'https://ui-avatars.com/api/?name=Plaid&background=00d4aa&color=fff&size=128',
          valuation: '$13.4B',
          fundingStage: 'Series D',
          foundedYear: 2013,
          employees: '1,500+',
          headquarters: 'San Francisco, CA',
          trending: false,
          featured: true
        }
      ],
      
      recentNews: [
        {
          id: '1',
          title: 'Stripe expands into emerging markets with local payment methods',
          summary: 'Payment giant adds support for 15 new countries and local payment methods.',
          date: '2024-01-14',
          source: 'Reuters',
          category: 'product'
        }
      ],
      
      insights: [
        {
          id: '1',
          title: 'Embedded Finance Driving Growth',
          description: 'Non-financial companies are integrating payment and lending services directly into their platforms.',
          trend: 'up',
          impact: 'high'
        }
      ]
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const industryData = mockIndustries[industrySlug];
      if (industryData) {
        setIndustry(industryData);
      } else {
        setError('Industry not found');
      }
      setLoading(false);
    }, 1000);
  }, [industrySlug]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !industry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Industry Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The industry you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/industries'}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Industries
          </Button>
        </div>
      </div>
    );
  }

  const sortedCompanies = useMemo(() => {
    return [...industry.topCompanies].sort((a, b) => {
      switch (sortBy) {
        case 'valuation':
          return parseFloat(b.valuation.replace(/[^0-9.]/g, '')) - parseFloat(a.valuation.replace(/[^0-9.]/g, ''));
        case 'founded':
          return b.foundedYear - a.foundedYear;
        case 'employees':
          const aEmployees = parseInt(a.employees.replace(/[^0-9]/g, ''));
          const bEmployees = parseInt(b.employees.replace(/[^0-9]/g, ''));
          return bEmployees - aEmployees;
        default:
          return 0;
      }
    });
  }, [industry.topCompanies, sortBy]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'companies', label: 'Top Companies' },
    { id: 'technologies', label: 'Trending Tech' },
    { id: 'insights', label: 'Market Insights' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative">
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={industry.heroImage}
            alt={`${industry.name} industry`}
            className="w-full h-full object-cover"
          />
          <div className={cn('absolute inset-0 bg-gradient-to-r opacity-90', industry.gradient)} />
        </div>

        <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <button 
                onClick={() => window.location.href = '/industries'}
                className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                All Industries
              </button>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">{industry.name}</span>
            </div>

            {/* Industry Header */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="text-6xl">{industry.icon}</div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {industry.name}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  {industry.description}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center">
                    <BuildingIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.statistics.totalStartups.toLocaleString()} startups
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSignIcon className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.statistics.totalFunding} total funding
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.statistics.jobOpenings.toLocaleString()} open positions
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUpIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.statistics.growthRate} growth rate
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {industry.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {metric.value}
                  </div>
                  <div className={cn(
                    'text-sm flex items-center',
                    metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    <TrendingUpIcon className={cn('h-3 w-3 mr-1', metric.positive ? '' : 'rotate-180')} />
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab industry={industry} />}
        {activeTab === 'companies' && <CompaniesTab companies={sortedCompanies} sortBy={sortBy} setSortBy={setSortBy} />}
        {activeTab === 'technologies' && <TechnologiesTab technologies={industry.trendingTechnologies} />}
        {activeTab === 'insights' && <InsightsTab insights={industry.insights} news={industry.recentNews} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ industry }: { industry: IndustryData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Industry Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            About {industry.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {industry.longDescription}
          </p>
        </div>

        {/* Top Companies Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Leading Companies
            </h3>
            <Button variant="outline" size="sm">
              View All
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {industry.topCompanies.slice(0, 4).map(company => (
              <CompanyPreviewCard key={company.id} company={company} />
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Latest Industry News
          </h3>
          <div className="space-y-4">
            {industry.recentNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Industry Statistics */}
        <IndustryStats statistics={industry.statistics} />
        
        {/* Top Technologies Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Trending Technologies
          </h3>
          <div className="space-y-3">
            {industry.trendingTechnologies.slice(0, 3).map(tech => (
              <TechnologyPreviewCard key={tech.id} technology={tech} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Companies Tab Component
function CompaniesTab({ 
  companies, 
  sortBy, 
  setSortBy 
}: { 
  companies: IndustryData['topCompanies']; 
  sortBy: string; 
  setSortBy: (sort: string) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Top Companies
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="valuation">Valuation</option>
          <option value="founded">Founded Year</option>
          <option value="employees">Team Size</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}

// Technologies Tab Component
function TechnologiesTab({ technologies }: { technologies: IndustryData['trendingTechnologies'] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Trending Technologies
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {technologies.map(tech => (
          <TechnologyCard key={tech.id} technology={tech} />
        ))}
      </div>
    </div>
  );
}

// Insights Tab Component
function InsightsTab({ 
  insights, 
  news 
}: { 
  insights: IndustryData['insights']; 
  news: IndustryData['recentNews']; 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Market Insights
        </h2>
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recent News
        </h2>
        {news.map(item => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </div>
  );
}

// Reusable Components
function IndustryStats({ statistics }: { statistics: IndustryData['statistics'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Industry Statistics
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Market Size</span>
          <span className="font-bold text-gray-900 dark:text-white">{statistics.marketSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Avg. Valuation</span>
          <span className="font-bold text-gray-900 dark:text-white">{statistics.avgValuation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Avg. Funding</span>
          <span className="font-bold text-gray-900 dark:text-white">{statistics.averageFunding}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Peak Funding Year</span>
          <span className="font-bold text-gray-900 dark:text-white">{statistics.topFundingYear}</span>
        </div>
      </div>
    </div>
  );
}

function CompanyPreviewCard({ company }: { company: IndustryData['topCompanies'][0] }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
      <img
        src={company.logo}
        alt={`${company.name} logo`}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {company.name}
          </h4>
          {company.trending && (
            <TrendingUpIcon className="h-4 w-4 text-orange-500" />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {company.valuation} • {company.fundingStage}
        </p>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: IndustryData['topCompanies'][0] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {company.name}
            </h3>
            {company.featured && (
              <StarIcon className="h-4 w-4 text-blue-500 fill-current" />
            )}
            {company.trending && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                Trending
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {company.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Valuation</span>
          <p className="font-semibold text-gray-900 dark:text-white">{company.valuation}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Stage</span>
          <p className="font-semibold text-gray-900 dark:text-white">{company.fundingStage}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Founded</span>
          <p className="font-semibold text-gray-900 dark:text-white">{company.foundedYear}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Team Size</span>
          <p className="font-semibold text-gray-900 dark:text-white">{company.employees}</p>
        </div>
      </div>
      
      <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        <MapPinIcon className="h-4 w-4 mr-1" />
        {company.headquarters}
      </div>
    </div>
  );
}

function TechnologyPreviewCard({ technology }: { technology: IndustryData['trendingTechnologies'][0] }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
          {technology.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {technology.startupCount} startups
        </p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-green-600 dark:text-green-400">
          {technology.growthRate}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {technology.adoptionRate}% adoption
        </div>
      </div>
    </div>
  );
}

function TechnologyCard({ technology }: { technology: IndustryData['trendingTechnologies'][0] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {technology.name}
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          {technology.category}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {technology.description}
      </p>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Adoption Rate</span>
          <span className="font-medium text-gray-900 dark:text-white">{technology.adoptionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${technology.adoptionRate}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Growth Rate</span>
          <span className="font-medium text-green-600 dark:text-green-400">{technology.growthRate}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Startups Using</span>
          <span className="font-medium text-gray-900 dark:text-white">{technology.startupCount}</span>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news }: { news: IndustryData['recentNews'][0] }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'funding': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'acquisition': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'product': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'partnership': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2">
      <div className="flex items-center space-x-2 mb-2">
        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getCategoryColor(news.category))}>
          {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {news.source} • {formatDate(news.date)}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
        {news.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {news.summary}
      </p>
    </div>
  );
}

function InsightCard({ insight }: { insight: IndustryData['insights'][0] }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down': return <TrendingUpIcon className="h-5 w-5 text-red-500 rotate-180" />;
      case 'stable': return <Target className="h-5 w-5 text-blue-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getTrendIcon(insight.trend)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            {insight.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {insight.description}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Impact: <span className={cn('font-medium', getImpactColor(insight.impact))}>
                {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
