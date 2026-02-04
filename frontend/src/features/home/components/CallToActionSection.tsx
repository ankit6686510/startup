'use client';

import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CallToActionSection() {
    return (
        <section className="py-24 bg-foreground text-background relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    Ready to Shape the Future?
                </h2>
                <p className="text-xl text-background/80 mb-10 max-w-2xl mx-auto">
                    Join 25,000+ investors and founders on the world's most advanced startup intelligence platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="bg-background text-foreground hover:bg-background/90 font-bold h-14 px-8 rounded-full text-lg"
                        onClick={() => window.location.href = '/register'}
                    >
                        Get Started Now
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-background/20 text-background hover:bg-white/10 h-14 px-8 rounded-full text-lg"
                        onClick={() => window.location.href = '/demo'}
                    >
                        Schedule Demo
                    </Button>
                </div>

                <p className="mt-8 text-sm text-background/40">
                    No credit card required for basic access • Cancel anytime
                </p>
            </div>
        </section>
    );
}
