'use client';

import { useEffect, useState } from 'react';
import { TrendingUpIcon, UsersIcon, DollarSignIcon, BuildingIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);

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

  const stats: Stat[] = [
    {
      label: 'Active Startups',
      value: '12,847',
      change: '+23%',
      icon: <BuildingIcon className="h-6 w-6" />,
      color: 'blue',
    },
    {
      label: 'Total Funding',
      value: '$52.3B',
      change: '+18%',
      icon: <DollarSignIcon className="h-6 w-6" />,
      color: 'green',
    },
    {
      label: 'Founders',
      value: '34,291',
      change: '+31%',
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'purple',
    },
    {
      label: 'Growth Rate',
      value: '156%',
      change: '+12%',
      icon: <TrendingUpIcon className="h-6 w-6" />,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <section id="stats-section" className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Platform Statistics
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time insights into the startup ecosystem and our growing community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50',
                isVisible ? 'animate-slide-in' : 'opacity-0 translate-y-10'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colorClasses[stat.color as keyof typeof colorClasses])}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {stat.change} this month
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Data Accuracy</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Verified information</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Updates</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Real-time tracking</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Countries</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Global coverage</div>
          </div>
        </div>
      </div>
    </section>
  );
}
