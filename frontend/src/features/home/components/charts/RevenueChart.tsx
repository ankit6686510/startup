'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
    data?: any[];
    isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
    if (isLoading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse">
                <div className="text-muted-foreground">Loading chart data...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-xl">
                <div className="text-muted-foreground">No data available</div>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                        unit="$"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        itemStyle={{ color: '#000' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#000" fill="#EAE4D5" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
