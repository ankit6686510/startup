'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAnalyticsHistory } from '@/features/analytics/hooks';
import { RevenueChart } from '@/features/home/components/charts/RevenueChart';
import { cn } from '@/lib/utils';
import { RefreshCwIcon } from 'lucide-react';

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    statLabel: string;
}

type TimeRange = '1m' | '6m' | '1y' | 'all';

export function AnalyticsModal({ isOpen, onClose, statLabel }: AnalyticsModalProps) {
    const [range, setRange] = useState<TimeRange>('6m');
    const { data, isLoading, isFetching } = useAnalyticsHistory(statLabel, range);

    // Map stat label to a backend metric key if needed, for now using label as is
    const ranges: { label: string; value: TimeRange }[] = [
        { label: '1M', value: '1m' },
        { label: '6M', value: '6m' },
        { label: '1Y', value: '1y' },
        { label: 'All', value: 'all' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${statLabel} Analysis`}
        >
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <p className="text-muted-foreground text-sm max-w-md">
                        Historical performance data for <strong>{statLabel}</strong>.
                        Analyze trends and compare against industry benchmarks.
                    </p>

                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                        {ranges.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    range === r.value
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                )}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[300px]">
                    {isFetching && !isLoading && (
                        <div className="absolute top-2 right-2 z-10">
                            <RefreshCwIcon className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <RevenueChart data={data?.data} isLoading={isLoading} />
                </div>

                <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                        <p className="font-bold text-xl text-foreground">
                            {data?.data && data.data.length > 0
                                ? `$${data.data[data.data.length - 1].value.toLocaleString()}`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Growth (Period)</p>
                        <p className="font-bold text-xl text-green-600">+12.5%</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prognosis</p>
                        <p className="font-bold text-xl text-foreground">Positive</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
