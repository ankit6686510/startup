import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Reuse the mock data structure (simplified for brevity, matching the Type)
    const mockStartups = [
        {
            id: '1',
            name: 'NeuralFlow AI',
            slug: 'neuralflow-ai',
            description: 'Revolutionary AI platform...',
            industry: 'AI & Machine Learning',
            location: { city: 'San Francisco', country: 'USA' },
            founded: '2023-01-01',
            logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
            totalFunded: 15200000,
            fundingStage: 'SERIES_A',
            followersCount: 1205,
            isSaved: true,
            status: 'ACTIVE',
            tagline: 'Automating enterprise decisions with AI',
            foundersCount: 2,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-06-15T00:00:00Z',
            trendScore: 98,
            weeklyGrowth: 15,
            monthlyGrowth: 45
        },
        {
            id: '2',
            name: 'GreenTech Solutions',
            slug: 'greentech-solutions',
            description: 'Sustainable energy...',
            industry: 'CleanTech',
            location: { city: 'Berlin', country: 'Germany' },
            founded: '2022-05-15',
            logo: 'https://ui-avatars.com/api/?name=GreenTech+Solutions&background=10b981&color=fff&size=128',
            totalFunded: 22500000,
            fundingStage: 'SERIES_B',
            followersCount: 850,
            isSaved: false,
            status: 'ACTIVE',
            tagline: 'Sustainable energy for everyone',
            foundersCount: 3,
            createdAt: '2022-05-15T00:00:00Z',
            updatedAt: '2023-07-20T00:00:00Z',
            trendScore: 92,
            weeklyGrowth: 10,
            monthlyGrowth: 30
        },
        // Add more mocks as needed
    ];

    return NextResponse.json(mockStartups.slice(0, limit));
}
