'use client';

import { QuoteIcon } from 'lucide-react';

export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "This platform completely transformed our fundraising process. We connected with our lead investor within 48 hours of listing.",
            author: "Sarah Chen",
            role: "Founder, NeuralFlow AI",
            image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=EAE4D5&color=000&size=128"
        },
        {
            quote: "The depth of data available here is unmatched. It's become our primary tool for sourcing and vetting early-stage deal flow.",
            author: "Marcus Rodriguez",
            role: "Partner, Horizon Ventures",
            image: "https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=EAE4D5&color=000&size=128"
        },
        {
            quote: "Finally, a platform that understands what modern founders need. Clean, fast, and incredibly effective at making connections.",
            author: "Elena Kowalski",
            role: "CEO, GreenTech Solutions",
            image: "https://ui-avatars.com/api/?name=Elena+Kowalski&background=EAE4D5&color=000&size=128"
        }
    ];

    return (
        <section className="py-24 bg-card border-t border-border">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
                        Trusted by Visionaries
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <div key={idx} className="bg-background p-8 rounded-2xl border border-border relative">
                            <QuoteIcon className="h-8 w-8 text-muted-foreground/20 absolute top-8 right-8" />

                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={item.image}
                                    alt={item.author}
                                    className="w-12 h-12 rounded-full border border-border"
                                />
                                <div>
                                    <p className="font-bold text-foreground text-sm">{item.author}</p>
                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground italic leading-relaxed">
                                "{item.quote}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
