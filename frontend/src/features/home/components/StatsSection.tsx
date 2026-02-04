

'use client';

import { useEffect, useState } from 'react';
import { TrendingUpIcon, UsersIcon, DollarSignIcon, BuildingIcon, ActivityIcon, GlobeIcon, BarChart3Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { RevenueChart } from './charts/RevenueChart';
import { GrowthChart } from './charts/GrowthChart';
import { useQuery } from '@tanstack/react-query';
import { MarketDataService } from '@/services/market-data';

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['marketStats'],
    queryFn: MarketDataService.getStats,
    staleTime: 1000 * 60 * 5,
  });

  // Fallback charts mapping
  const getChartForStat = (label: string) => {
    if (label.includes('Funding') || label.includes('Exits')) return <RevenueChart />;
    return <GrowthChart />;
  };

  const getIconForStat = (label: string) => {
    if (label.includes('Building') || label.includes('Startups')) return <BuildingIcon className="h-5 w-5" />;
    if (label.includes('Funding') || label.includes('Dollar')) return <DollarSignIcon className="h-5 w-5" />;
    if (label.includes('Founders') || label.includes('Users')) return <UsersIcon className="h-5 w-5" />;
    return <ActivityIcon className="h-5 w-5" />;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const activeStat = stats?.find(s => s.label === selectedStat);

  return (
    <section id="stats-section" className="py-20 bg-muted/30 border-t border-border relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stats?.map((stat, idx) => (
            <div
              key={stat.label}
              onClick={() => setSelectedStat(stat.label)}
              className="group bg-card border border-border/50 rounded-2xl p-6 hover:shadow-lg transition duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg", stat.bgColor, stat.color)}>
                  {getIconForStat(stat.label)}
                </div>
                <div className="flex items-center space-x-1 text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUpIcon className="h-3 w-3" />
                  <span>{stat.change}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Global Reach Bar */}
        <div className="mt-16 bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <GlobeIcon className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Global Ecosystem Coverage</h4>
              <p className="text-muted-foreground text-sm">Real-time data from 150+ countries and 45 distinct industries.</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">99.9%</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Uptime</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">50ms</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Latency</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">Daily</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Updates</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedStat || ''}
      >
        <div className="p-4">
          <p className="text-muted-foreground mb-6">
            Deep dive analysis for <strong>{selectedStat}</strong>. This data helps investors track market velocity and liquidity events in real-time.
          </p>
          {activeStat && getChartForStat(activeStat.label)}
        </div>
      </Modal>
    </section>
  );
}

