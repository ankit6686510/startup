
'use client';

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
import { IndustryCard, Industry } from './IndustryCard';

export function IndustryOverview() {
  const industries: Industry[] = [
    {
      name: 'AI & Machine Learning',
      slug: 'ai-ml',
      icon: <BrainIcon className="h-6 w-6" />,
      startupCount: 2847,
      fundingRaised: '$12.4B',
      growthRate: '+45%',
      description: 'Revolutionizing industries with intelligent automation and data-driven insights.',
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-purple-500/0',
      examples: ['OpenAI', 'Anthropic', 'Scale AI'],
    },
    {
      name: 'Fintech',
      slug: 'fintech',
      icon: <CreditCardIcon className="h-6 w-6" />,
      startupCount: 1923,
      fundingRaised: '$8.7B',
      growthRate: '+32%',
      description: 'Transforming financial services through technology and innovation.',
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-green-500/0',
      examples: ['Stripe', 'Plaid', 'Robinhood'],
    },
    {
      name: 'HealthTech',
      slug: 'healthtech',
      icon: <HeartIcon className="h-6 w-6" />,
      startupCount: 1654,
      fundingRaised: '$9.2B',
      growthRate: '+38%',
      description: 'Improving healthcare outcomes through digital innovation.',
      color: 'text-rose-400',
      gradient: 'from-rose-500/20 to-rose-500/0',
      examples: ['Teladoc', 'Moderna', 'Veracyte'],
    },
    {
      name: 'EdTech',
      slug: 'edtech',
      icon: <GraduationCapIcon className="h-6 w-6" />,
      startupCount: 1234,
      fundingRaised: '$4.1B',
      growthRate: '+28%',
      description: 'Revolutionizing education and learning experiences.',
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-orange-500/0',
      examples: ['Coursera', 'Duolingo', 'Udemy'],
    },
    {
      name: 'CleanTech',
      slug: 'cleantech',
      icon: <LeafIcon className="h-6 w-6" />,
      startupCount: 987,
      fundingRaised: '$6.8B',
      growthRate: '+52%',
      description: 'Building sustainable solutions for a greener future.',
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-emerald-500/0',
      examples: ['Tesla', 'Rivian', 'Sunrun'],
    },
    {
      name: 'E-Commerce',
      slug: 'ecommerce',
      icon: <ShoppingCartIcon className="h-6 w-6" />,
      startupCount: 1456,
      fundingRaised: '$5.3B',
      growthRate: '+25%',
      description: 'Redefining retail and consumer experiences online.',
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-pink-500/0',
      examples: ['Shopify', 'BigCommerce', 'WooCommerce'],
    },
    {
      name: 'Mobility',
      slug: 'mobility',
      icon: <CarIcon className="h-6 w-6" />,
      startupCount: 743,
      fundingRaised: '$7.9B',
      growthRate: '+41%',
      description: 'Transforming transportation and urban mobility.',
      color: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-indigo-500/0',
      examples: ['Uber', 'Lyft', 'Bird'],
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      icon: <GamepadIcon className="h-6 w-6" />,
      startupCount: 892,
      fundingRaised: '$3.6B',
      growthRate: '+35%',
      description: 'Creating immersive entertainment and virtual experiences.',
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-red-500/0',
      examples: ['Epic Games', 'Unity', 'Roblox'],
    },
  ];

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Sectors</span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mt-2">
              Explore by Industry
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => window.location.href = '/industries'}
          >
            View All Sectors
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Industry {
  name: string;
  slug: string;
  icon: React.ReactNode;
  startupCount: number;
  fundingRaised: string;
  growthRate: string;
  description: string;
  color: string;
  gradient: string;
  examples: string[];
}

export function IndustryOverview() {
  const industries: Industry[] = [
    {
      name: 'AI & Machine Learning',
      slug: 'ai-ml',
      icon: <BrainIcon className="h-6 w-6" />,
      startupCount: 2847,
      fundingRaised: '$12.4B',
      growthRate: '+45%',
      description: 'Revolutionizing industries with intelligent automation and data-driven insights.',
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-purple-500/0',
      examples: ['OpenAI', 'Anthropic', 'Scale AI'],
    },
    {
      name: 'Fintech',
      slug: 'fintech',
      icon: <CreditCardIcon className="h-6 w-6" />,
      startupCount: 1923,
      fundingRaised: '$8.7B',
      growthRate: '+32%',
      description: 'Transforming financial services through technology and innovation.',
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-green-500/0',
      examples: ['Stripe', 'Plaid', 'Robinhood'],
    },
    {
      name: 'HealthTech',
      slug: 'healthtech',
      icon: <HeartIcon className="h-6 w-6" />,
      startupCount: 1654,
      fundingRaised: '$9.2B',
      growthRate: '+38%',
      description: 'Improving healthcare outcomes through digital innovation.',
      color: 'text-rose-400',
      gradient: 'from-rose-500/20 to-rose-500/0',
      examples: ['Teladoc', 'Moderna', 'Veracyte'],
    },
    {
      name: 'EdTech',
      slug: 'edtech',
      icon: <GraduationCapIcon className="h-6 w-6" />,
      startupCount: 1234,
      fundingRaised: '$4.1B',
      growthRate: '+28%',
      description: 'Revolutionizing education and learning experiences.',
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-orange-500/0',
      examples: ['Coursera', 'Duolingo', 'Udemy'],
    },
    {
      name: 'CleanTech',
      slug: 'cleantech',
      icon: <LeafIcon className="h-6 w-6" />,
      startupCount: 987,
      fundingRaised: '$6.8B',
      growthRate: '+52%',
      description: 'Building sustainable solutions for a greener future.',
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-emerald-500/0',
      examples: ['Tesla', 'Rivian', 'Sunrun'],
    },
    {
      name: 'E-Commerce',
      slug: 'ecommerce',
      icon: <ShoppingCartIcon className="h-6 w-6" />,
      startupCount: 1456,
      fundingRaised: '$5.3B',
      growthRate: '+25%',
      description: 'Redefining retail and consumer experiences online.',
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-pink-500/0',
      examples: ['Shopify', 'BigCommerce', 'WooCommerce'],
    },
    {
      name: 'Mobility',
      slug: 'mobility',
      icon: <CarIcon className="h-6 w-6" />,
      startupCount: 743,
      fundingRaised: '$7.9B',
      growthRate: '+41%',
      description: 'Transforming transportation and urban mobility.',
      color: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-indigo-500/0',
      examples: ['Uber', 'Lyft', 'Bird'],
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      icon: <GamepadIcon className="h-6 w-6" />,
      startupCount: 892,
      fundingRaised: '$3.6B',
      growthRate: '+35%',
      description: 'Creating immersive entertainment and virtual experiences.',
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-red-500/0',
      examples: ['Epic Games', 'Unity', 'Roblox'],
    },
  ];

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Sectors</span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mt-2">
              Explore by Industry
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => window.location.href = '/industries'}
          >
            View All Sectors
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition duration-300 cursor-pointer overflow-hidden"
              onClick={() => window.location.href = `/startups?industry=${industry.slug}`}
            >
              {/* Hover Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                industry.gradient
              )} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-2 rounded-lg bg-muted border border-border", industry.color)}>
                    {industry.icon}
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                    {industry.growthRate} YoY
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {industry.name}
                </h3>

                <div className="flex justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Startups</span>
                    <span className="font-mono font-bold text-foreground">{industry.startupCount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Funding</span>
                    <span className="font-mono font-bold text-foreground">{industry.fundingRaised}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {industry.examples.slice(0, 3).map((example) => (
                    <span key={example} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium border border-border">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
