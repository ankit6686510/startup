'use client';

import { ArrowRightIcon, TrendingUpIcon, CommandIcon, PlayCircleIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/molecules/SearchBar';

export function HeroSection() {

  return (
    <section className="relative overflow-hidden bg-background text-foreground min-h-[90vh] flex items-center border-b border-border">
      {/* Background Gradients - Adjusted for Beige Theme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-muted/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/40 border border-border rounded-full px-3 py-1 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-sm font-medium text-foreground/80">Live Market Intelligence</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
              Decide with
              <span className="block text-foreground/90 font-serif italic">
                Certainty
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Access real-time data on 10,000+ startups. Track funding rounds, analyze growth metrics, and discover the next unicorn before anyone else.
            </p>

            <SearchBar
              onSearch={(query) => {
                if (query.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
              }}
              placeholder="Search startups, investors, or trends..."
              className="max-w-md"
            />

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-12 rounded-full border-0 shadow-md"
                onClick={() => window.location.href = '/startups'}
              >
                Start Exploring
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 border-input text-foreground hover:bg-muted/50"
                onClick={() => window.location.href = '/demo'}
              >
                <PlayCircleIcon className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-8 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-2">
                <CommandIcon className="h-4 w-4" />
                <span>Enterprise API</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span>25k+ Investors</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                <span>Real-time Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="relative hidden lg:block">
            {/* Absolute decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-tr from-accent/20 to-muted/20 rounded-full blur-3xl" />

            <div className="relative bg-white/60 border border-white/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl skew-y-[-2deg] hover:skew-y-0 transition duration-500 ring-1 ring-black/5">
              {/* Header of the mock card */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">N</div>
                  <div>
                    <h3 className="font-bold text-foreground">NeuralFlow AI</h3>
                    <p className="text-xs text-muted-foreground">Series B • San Francisco</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                  +124% Growth
                </span>
              </div>

              {/* Chart Mock */}
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 gap-2 px-2">
                  {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-full bg-primary/80 rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/50 p-4 rounded-xl border border-white/60 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Total Funding</p>
                  <p className="text-2xl font-bold text-foreground">$45.2M</p>
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-white/60 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Valuation</p>
                  <p className="text-2xl font-bold text-foreground">$420M</p>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white/80 p-4 rounded-xl border border-white/40 backdrop-blur-md shadow-xl w-64 animate-bounce duration-[3000ms] ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUpIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">New Investment</p>
                  <p className="text-sm font-bold text-foreground">Sequoia Cap.</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Just invested <span className="text-foreground font-bold">$12M</span> in GreenTech
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
