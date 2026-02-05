

'use client';

import { useEffect, useState } from 'react';
import { UsersIcon, DollarSignIcon, BuildingIcon, ActivityIcon, GlobeIcon, BarChart3Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyticsModal } from '@/features/analytics/components/AnalyticsModal';
import { StatTicker } from '@/components/molecules/StatTicker';
import { useMarketStats, useGlobalReach } from '@/features/home/hooks';
import { RevenueChart } from './charts/RevenueChart';
import { GrowthChart } from './charts/GrowthChart';

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const { data: stats } = useMarketStats();
  const { data: reach } = useGlobalReach();

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
          {stats?.map((stat) => (
            <StatTicker
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={getIconForStat(stat.label)}
              iconColor={stat.color}
              iconBgColor={stat.bgColor}
              sparklineData={stat.sparkline}
              onClick={() => setSelectedStat(stat.label)}
            />
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
              <p className="text-muted-foreground text-sm">
                Real-time data from {reach?.countries || '150+'} countries and {reach?.industries || '45'} distinct industries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reach?.uptime || '99.9%'}</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Uptime</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reach?.latency || '50ms'}</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Latency</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reach?.updates || 'Daily'}</p>
              <p className="text-xs text-muted-foreground uppercase font-bold">Updates</p>
            </div>
          </div>
        </div>
      </div>


      <AnalyticsModal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        statLabel={selectedStat || ''}
      />
    </section>
  );
}

