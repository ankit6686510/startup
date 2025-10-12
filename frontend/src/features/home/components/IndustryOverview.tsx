'use client';

import { useState } from 'react';
import { 
  BrainIcon, 
  CreditCardIcon, 
  HeartIcon, 
  GraduationCapIcon, 
  LeafIcon, 
  ShoppingCartIcon,
  CarIcon,
  GamepadIcon,
  ArrowRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Industry {
  name: string;
  slug: string;
  icon: React.ReactNode;
  startupCount: number;
  fundingRaised: string;
  growthRate: string;
  description: string;
  color: string;
  examples: string[];
}

export function IndustryOverview() {
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);

  const industries: Industry[] = [
    {
      name: 'AI & Machine Learning',
      slug: 'ai-ml',
      icon: <BrainIcon className="h-8 w-8" />,
      startupCount: 2847,
      fundingRaised: '$12.4B',
      growthRate: '+45%',
      description: 'Revolutionizing industries with intelligent automation and data-driven insights.',
      color: 'purple',
      examples: ['OpenAI', 'Anthropic', 'Scale AI'],
    },
    {
      name: 'Fintech',
      slug: 'fintech',
      icon: <CreditCardIcon className="h-8 w-8" />,
      startupCount: 1923,
      fundingRaised: '$8.7B',
      growthRate: '+32%',
      description: 'Transforming financial services through technology and innovation.',
      color: 'green',
      examples: ['Stripe', 'Plaid', 'Robinhood'],
    },
    {
      name: 'HealthTech',
      slug: 'healthtech',
      icon: <HeartIcon className="h-8 w-8" />,
      startupCount: 1654,
      fundingRaised: '$9.2B',
      growthRate: '+38%',
      description: 'Improving healthcare outcomes through digital innovation.',
      color: 'blue',
      examples: ['Teladoc', 'Moderna', 'Veracyte'],
    },
    {
      name: 'EdTech',
      slug: 'edtech',
      icon: <GraduationCapIcon className="h-8 w-8" />,
      startupCount: 1234,
      fundingRaised: '$4.1B',
      growthRate: '+28%',
      description: 'Revolutionizing education and learning experiences.',
      color: 'orange',
      examples: ['Coursera', 'Duolingo', 'Udemy'],
    },
    {
      name: 'CleanTech',
      slug: 'cleantech',
      icon: <LeafIcon className="h-8 w-8" />,
      startupCount: 987,
      fundingRaised: '$6.8B',
      growthRate: '+52%',
      description: 'Building sustainable solutions for a greener future.',
      color: 'emerald',
      examples: ['Tesla', 'Rivian', 'Sunrun'],
    },
    {
      name: 'E-Commerce',
      slug: 'ecommerce',
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      startupCount: 1456,
      fundingRaised: '$5.3B',
      growthRate: '+25%',
      description: 'Redefining retail and consumer experiences online.',
      color: 'pink',
      examples: ['Shopify', 'BigCommerce', 'WooCommerce'],
    },
    {
      name: 'Mobility',
      slug: 'mobility',
      icon: <CarIcon className="h-8 w-8" />,
      startupCount: 743,
      fundingRaised: '$7.9B',
      growthRate: '+41%',
      description: 'Transforming transportation and urban mobility.',
      color: 'indigo',
      examples: ['Uber', 'Lyft', 'Bird'],
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      icon: <GamepadIcon className="h-8 w-8" />,
      startupCount: 892,
      fundingRaised: '$3.6B',
      growthRate: '+35%',
      description: 'Creating immersive entertainment and virtual experiences.',
      color: 'red',
      examples: ['Epic Games', 'Unity', 'Roblox'],
    },
  ];

  const colorClasses = {
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    pink: 'bg-pink-500 hover:bg-pink-600 text-white',
    indigo: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    red: 'bg-red-500 hover:bg-red-600 text-white',
  };

  const cardColorClasses = {
    purple: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700',
    green: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700',
    blue: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700',
    orange: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700',
    emerald: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700',
    pink: 'border-pink-200 hover:border-pink-300 dark:border-pink-800 dark:hover:border-pink-700',
    indigo: 'border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700',
    red: 'border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700',
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore by Industry
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover innovative startups across diverse industries and emerging sectors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {industries.map((industry, index) => (
            <div
              key={industry.slug}
              className={cn(
                'group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl',
                cardColorClasses[industry.color as keyof typeof cardColorClasses],
                hoveredIndustry === industry.slug ? 'scale-105 shadow-xl' : ''
              )}
              onMouseEnter={() => setHoveredIndustry(industry.slug)}
              onMouseLeave={() => setHoveredIndustry(null)}
              onClick={() => window.location.href = `/startups?industry=${industry.slug}`}
            >
              {/* Icon and Header */}
              <div className="mb-4">
                <div className={cn(
                  'inline-flex p-3 rounded-xl transition-all duration-300',
                  colorClasses[industry.color as keyof typeof colorClasses]
                )}>
                  {industry.icon}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {industry.description}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Startups</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {industry.startupCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Funding</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {industry.fundingRaised}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Growth</span>
                  <span className="font-semibold text-green-600">
                    {industry.growthRate}
                  </span>
                </div>
              </div>

              {/* Examples */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Notable startups:</div>
                <div className="flex flex-wrap gap-1">
                  {industry.examples.slice(0, 2).map((example) => (
                    <span
                      key={example}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Explore
                </span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3"
            onClick={() => window.location.href = '/industries'}
          >
            View All Industries
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
