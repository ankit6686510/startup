import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'revenue';
    const range = searchParams.get('range') || '6m';

    // Mock data generation based on range
    const generateData = (count: number, baseValue: number, growthRate: number) => {
        const data = [];
        const now = new Date();
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - i);
            const monthName = date.toLocaleString('default', { month: 'short' });

            // Random fluctuation
            const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
            const value = Math.round(baseValue * Math.pow(1 + growthRate, count - 1 - i) * randomFactor);

            data.push({
                name: monthName,
                value: value,
                originalDate: date.toISOString(),
            });
        }
        return data;
    };

    let dataPoints = 6;
    let baseValue = 10000;
    const growth = 0.05; // 5% monthly

    if (range === '1m') {
        dataPoints = 4; // weeks
        baseValue = 2500;
        // Special logic for weeks if strictly needed, but reusing monthly generator for simplicity of mock
        // adjusting labels for weeks
        const weeklyData = [];
        for (let i = 0; i < 4; i++) {
            weeklyData.push({ name: `Week ${i + 1}`, value: Math.round(2500 + Math.random() * 500) })
        }
        return NextResponse.json(weeklyData);
    } else if (range === '6m') {
        dataPoints = 6;
        baseValue = 50000;
    } else if (range === '1y') {
        dataPoints = 12;
        baseValue = 40000;
    } else if (range === 'all') {
        dataPoints = 24;
        baseValue = 10000;
    }

    const data = generateData(dataPoints, baseValue, growth);

    // Generate a comparison line (e.g., Industry Average)
    const comparisonData = generateData(dataPoints, baseValue * 0.8, 0.03);

    return NextResponse.json({
        metric,
        range,
        data,
        comparison: comparisonData
    });
}
