import { Startup } from '@/features/startups/components/StartupCard';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
const MOCK_STARTUPS: Startup[] = [
    {
        id: '1',
        name: 'NeuralFlow AI',
        slug: 'neuralflow-ai',
        description: 'Revolutionary AI platform that automates complex data analysis and provides real-time insights for enterprise decision making.',
        industry: 'AI & Machine Learning',
        location: 'San Francisco, CA',
        foundedYear: 2023,
        logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
        website: 'https://neuralflow.ai',
        totalFunding: '$15.2M',
        stage: 'Series A',
        employeeCount: 45,
        verified: true,
        trending: true,
        founders: [
            { name: 'Sarah Chen', title: 'CEO & Co-founder' },
            { name: 'Marcus Rodriguez', title: 'CTO & Co-founder' }
        ],
        tags: ['AI', 'Enterprise', 'Analytics']
    },
    {
        id: '2',
        name: 'GreenTech Solutions',
        slug: 'greentech-solutions',
        description: 'Building sustainable energy storage solutions using revolutionary battery technology for renewable energy systems.',
        industry: 'CleanTech',
        location: 'Berlin, Germany',
        foundedYear: 2022,
        logo: 'https://ui-avatars.com/api/?name=GreenTech+Solutions&background=10b981&color=fff&size=128',
        website: 'https://greentechsolutions.com',
        totalFunding: '$22.5M',
        stage: 'Series B',
        employeeCount: 78,
        verified: true,
        trending: false,
        founders: [
            { name: 'Dr. Elena Kowalski', title: 'CEO & Founder' },
            { name: 'James Mitchell', title: 'Head of Engineering' }
        ],
        tags: ['CleanTech', 'Energy', 'Sustainability']
    },
    {
        id: '3',
        name: 'HealthBridge',
        slug: 'healthbridge',
        description: 'Connecting patients with healthcare providers through AI-powered telemedicine platform with real-time health monitoring.',
        industry: 'HealthTech',
        location: 'London, UK',
        foundedYear: 2024,
        logo: 'https://ui-avatars.com/api/?name=HealthBridge&background=ef4444&color=fff&size=128',
        website: 'https://healthbridge.io',
        totalFunding: '$8.7M',
        stage: 'Seed',
        employeeCount: 28,
        verified: true,
        trending: true,
        founders: [
            { name: 'Dr. Amara Okafor', title: 'CEO & Co-founder' },
            { name: 'Thomas Anderson', title: 'CPO & Co-founder' }
        ],
        tags: ['HealthTech', 'Telemedicine', 'AI']
    },
    {
        id: '4',
        name: 'EduNext',
        slug: 'edunext',
        description: 'Personalized learning platform that adapts to individual student needs using advanced AI and gamification techniques.',
        industry: 'EdTech',
        location: 'Bangalore, India',
        foundedYear: 2023,
        logo: 'https://ui-avatars.com/api/?name=EduNext&background=f59e0b&color=fff&size=128',
        website: 'https://edunext.com',
        totalFunding: '$12.1M',
        stage: 'Series A',
        employeeCount: 52,
        verified: false,
        trending: true,
        founders: [
            { name: 'Priya Sharma', title: 'CEO & Founder' },
            { name: 'Raj Patel', title: 'CTO & Co-founder' }
        ],
        tags: ['EdTech', 'AI', 'Gamification']
    },
    {
        id: '5',
        name: 'FinanceFlow',
        slug: 'financeflow',
        description: 'Next-generation payment infrastructure for emerging markets with focus on financial inclusion and micro-transactions.',
        industry: 'Fintech',
        location: 'Singapore',
        foundedYear: 2022,
        logo: 'https://ui-avatars.com/api/?name=FinanceFlow&background=8b5cf6&color=fff&size=128',
        website: 'https://financeflow.sg',
        totalFunding: '$35.8M',
        stage: 'Series B',
        employeeCount: 95,
        verified: true,
        trending: false,
        founders: [
            { name: 'Li Wei Zhang', title: 'CEO & Co-founder' },
            { name: 'Aisha Rahman', title: 'COO & Co-founder' }
        ],
        tags: ['Fintech', 'Payments', 'B2B']
    },
    {
        id: '6',
        name: 'SpaceLogistics',
        slug: 'spacelogistics',
        description: 'Innovative satellite technology for global supply chain tracking and logistics optimization in real-time.',
        industry: 'SpaceTech',
        location: 'Los Angeles, CA',
        foundedYear: 2023,
        logo: 'https://ui-avatars.com/api/?name=SpaceLogistics&background=06b6d4&color=fff&size=128',
        website: 'https://spacelogistics.com',
        totalFunding: '$45.2M',
        stage: 'Series C',
        employeeCount: 120,
        verified: true,
        trending: true,
        founders: [
            { name: 'Alex Turner', title: 'CEO & Founder' },
            { name: 'Dr. Maria Santos', title: 'Chief Scientist' }
        ],
        tags: ['SpaceTech', 'Logistics', 'Satellites']
    }
];

export const StartupService = {
    getFeatured: async (): Promise<Startup[]> => {
        await delay(800);
        // In a real app, this would be: axios.get('/api/startups/featured')
        return MOCK_STARTUPS;
    },

    getAll: async (): Promise<Startup[]> => {
        await delay(500);
        return MOCK_STARTUPS;
    },

    getBySlug: async (slug: string): Promise<Startup | undefined> => {
        await delay(300);
        return MOCK_STARTUPS.find(s => s.slug === slug);
    }
};
