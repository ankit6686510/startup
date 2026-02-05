import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { MetricValue } from '@/components/atoms/MetricValue';

export interface StatTickerProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    iconColor?: string;
    iconBgColor?: string;
    className?: string;
    onClick?: () => void;
    sparklineData?: number[];
}

export function StatTicker({
    label,
    value,
    change,
    trend = 'neutral',
    icon,
    iconColor,
    iconBgColor,
    className,
    onClick,
    sparklineData = [10, 20, 15, 30, 25, 40]
}: StatTickerProps) {

    const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : MinusIcon;
    const trendColor = trend === 'up' ? 'text-green-600 bg-green-100' : trend === 'down' ? 'text-red-600 bg-red-100' : 'text-slate-600 bg-slate-100';
    const sparkColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#475569';

    // Simple SVG sparkline logic
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min;
    const width = 80;
    const height = 30;
    const points = sparklineData.map((d, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((d - min) / (range || 1)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-card border border-border/50 rounded-2xl p-6 hover:shadow-lg transition duration-300 cursor-pointer relative overflow-hidden",
                className
            )}
        >
            <div className="flex items-center justify-between mb-4">
                {/* We reuse IconWrapper conceptually, but here we might need custom styles passed in props */}
                <div className={cn("p-2.5 rounded-lg flex items-center justify-center", iconBgColor, iconColor)}>
                    {icon}
                </div>

                {change && (
                    <div className={cn("flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full", trendColor)}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <MetricValue value={value} label={label} />

                <div className="pb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg width="80" height="30" className="overflow-visible">
                        <polyline
                            fill="none"
                            stroke={sparkColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
