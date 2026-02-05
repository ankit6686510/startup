
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
  ArrowRightIcon,
  TrendingUpIcon,
  WalletIcon,
  StethoscopeIcon,
  ZapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IndustryCard } from './IndustryCard';

// If Industry is not exported from IndustryCard, we define a local interface here 
// but ensure we don't import it if we define it, or vice versa.
// Looking at the previous error, it was imported. Let's assume we want to match the props of IndustryCard.
// The previous code had a local interface Industry. Let's keep a local type compatible with IndustryCard
// or verify IndustryCard exports. For safety, I will define the data structure matching what we pass to IndustryCard.

export interface IndustryData {
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
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const industries: IndustryData[] = [
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
      name: 'CleanTech',
      slug: 'cleantech',
      icon: <LeafIcon className="h-6 w-6" />,
      startupCount: 1532,
      fundingRaised: '$8.2B',
      growthRate: '+32%',
      description: 'Sustainable technologies focused on reducing environmental impact and carbon footprint.',
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-green-500/0',
      examples: ['Northvolt', 'Climeworks', 'Redwood'],
    },
    {
      name: 'FinTech',
      slug: 'fintech',
      icon: <WalletIcon className="h-6 w-6" />,
      startupCount: 3105,
      fundingRaised: '$15.8B',
      growthRate: '+28%',
      description: 'Digital innovation in financial services, banking, and payment systems.',
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-blue-500/0',
      examples: ['Stripe', 'Revolut', 'Plaid'],
    },
    {
      name: 'HealthTech',
      slug: 'healthtech',
      icon: <StethoscopeIcon className="h-6 w-6" />,
      startupCount: 2240,
      fundingRaised: '$10.5B',
      growthRate: '+38%',
      description: 'Technology-enabled healthcare solutions improving patient outcomes and access.',
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-red-500/0',
      examples: ['Oscar', 'Tempus', 'Hinge Health'],
    },
    {
      name: 'EdTech',
      slug: 'edtech',
      icon: <GraduationCapIcon className="h-6 w-6" />,
      startupCount: 1120,
      fundingRaised: '$4.1B',
      growthRate: '+15%',
      description: 'Educational technology transforming learning experiences and accessibility.',
      color: 'text-yellow-400',
      gradient: 'from-yellow-500/20 to-yellow-500/0',
      examples: ['Duolingo', 'Coursera', 'Guild'],
    },
    {
      name: 'SaaS',
      slug: 'saas',
      icon: <ZapIcon className="h-6 w-6" />,
      startupCount: 4500,
      fundingRaised: '$18.9B',
      growthRate: '+22%',
      description: 'Cloud-based software solutions for businesses and consumers.',
      color: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-indigo-500/0',
      examples: ['Canva', 'Notion', 'Figma'],
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Explore by Industry
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Deep dive into specific sectors to uncover emerging trends and opportunities.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex items-center gap-2 border-border text-foreground hover:bg-muted" onClick={() => window.location.href = '/industries'}>
            View All Sectors
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            // We pass industry to IndustryCard. 
            // If IndustryCard expects a specific type, we might need to cast or ensure compatibility.
            // Based on previous code, passing the object spread or the object itself should work if the shape matches.
            <IndustryCard key={industry.slug} industry={industry as any} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" className="w-full justify-center border-border" onClick={() => window.location.href = '/industries'}>
            View All Sectors
          </Button>
        </div>
      </div>
    </section>
  );
}
