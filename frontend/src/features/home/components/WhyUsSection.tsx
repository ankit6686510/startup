'use client';

import { ShieldCheckIcon, Globe2Icon, ZapIcon, BarChart3Icon } from 'lucide-react';

export function WhyUsSection() {
    const features = [
        {
            title: 'AI-Driven Diligence',
            description: 'Our proprietary algorithms analyze thousands of data points to surface high-potential startups before they trend.',
            icon: <ZapIcon className="h-6 w-6 text-foreground" />,
        },
        {
            title: 'Global Network Access',
            description: 'Connect instantly with verified founders and investors from over 150 countries without geographical barriers.',
            icon: <Globe2Icon className="h-6 w-6 text-foreground" />,
        },
        {
            title: 'Bank-Grade Security',
            description: 'Enterprise-level encryption and compliance standards ensure your data and transactions remain 100% secure.',
            icon: <ShieldCheckIcon className="h-6 w-6 text-foreground" />,
        },
        {
            title: 'Real-Time Analytics',
            description: 'Track portfolio performance, market trends, and competitor movements with millisecond-latency updates.',
            icon: <BarChart3Icon className="h-6 w-6 text-foreground" />,
        },
    ];

    return (
        <section className="py-24 bg-background border-t border-border">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Why Choose Us</span>
                    <h2 className="text-3xl md:text-5xl font-black text-foreground mt-3 mb-6">
                        Built for the Modern Investor
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We combine cutting-edge technology with human expertise to provide the most reliable startup intelligence platform in the market.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-8 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
