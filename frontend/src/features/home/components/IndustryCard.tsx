'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface Industry {
    name: string;
    slug: string;
    icon: ReactNode;
    startupCount: number;
    fundingRaised: string;
    growthRate: string;
    description: string;
    color: string;
    gradient: string;
    examples: string[];
}

interface IndustryCardProps {
    industry: Industry;
}

export function IndustryCard({ industry }: IndustryCardProps) {
    return (
        <div
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
    );
}
