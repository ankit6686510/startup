import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { startupIds } = await request.json();

    // Mock data for comparison
    const mockStartups = [
        {
            id: '1',
            name: 'NeuralFlow AI',
            tagline: 'AI for Enterprise',
            description: 'Revolutionary AI platform...',
            industry: 'AI & Machine Learning',
            location: { city: 'San Francisco', country: 'USA' },
            founded: '2023-01-01',
            logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
            totalFunded: 15200000,
            fundingStage: 'SERIES_A',
            followersCount: 1205,
            employeeCount: '11-50',
            status: 'ACTIVE',
            isSaved: true,
            website: 'https://neuralflow.ai'
        },
        {
            id: '2',
            name: 'GreenTech Solutions',
            tagline: 'Sustainable Energy Storage',
            description: 'Sustainable energy...',
            industry: 'CleanTech',
            location: { city: 'Berlin', country: 'Germany' },
            founded: '2022-05-15',
            logo: 'https://ui-avatars.com/api/?name=GreenTech+Solutions&background=10b981&color=fff&size=128',
            totalFunded: 22500000,
            fundingStage: 'SERIES_B',
            followersCount: 850,
            employeeCount: '51-100',
            status: 'ACTIVE',
            isSaved: false,
            website: 'https://greentech.com'
        },
        // Add more startups if needed or filter based on IDs
    ];

    // In a real app, filtering would happen here based on startupIds
    const selectedStartups = mockStartups.filter(s => startupIds.includes(s.id));

    // If we don't have enough mocks, just return all of them if IDs match somewhat, or just return mocks for demo
    const finalStartups = selectedStartups.length > 0 ? selectedStartups : mockStartups.slice(0, 2);

    return NextResponse.json({
        startups: finalStartups,
        metrics: [
            { name: 'Total Funding', values: finalStartups.map(s => s.totalFunded) },
            { name: 'Employees', values: finalStartups.map(s => s.employeeCount) }
        ]
    });
}
