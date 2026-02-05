import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Reuse mock data
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
            isSaved: true,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'GreenTech Solutions',
            tagline: 'Sustainable Energy',
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'HealthBridge',
            tagline: 'Telemedicine for All',
            description: 'Healthcare platform...',
            industry: 'HealthTech',
            location: { city: 'London', country: 'UK' },
            founded: '2024-02-01',
            logo: 'https://ui-avatars.com/api/?name=HealthBridge&background=ef4444&color=fff&size=128',
            totalFunded: 8700000,
            fundingStage: 'SEED',
            followersCount: 320,
            isSaved: true,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        // Add more as needed
    ];

    return NextResponse.json({
        items: mockStartups,
        total: mockStartups.length,
        page,
        pageSize,
        hasMore: false
    });
}
