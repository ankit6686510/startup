import { render, screen, fireEvent } from '@testing-library/react';
import { StartupCard } from './StartupCardComponent';
import { Startup } from '../types';
import { vi } from 'vitest';

// Mock types
const mockStartup: Startup = {
    id: '1',
    name: 'Test Startup',
    slug: 'test-startup',
    tagline: 'Revolutionizing testing',
    description: 'A platform for testing.',
    industry: 'Tech',
    location: { city: 'New York', country: 'USA' },
    foundedYear: 2023,
    founded: '2023-01-01',
    totalFunded: 1000000,
    fundingStage: 'SEED',
    employeeCount: '11-50',
    verified: true,
    trending: false,
    status: 'ACTIVE',
    foundersCount: 2,
    followersCount: 100,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    founders: [],
    tags: ['AI', 'Tech'],
    logo: 'https://example.com/logo.png',
};

// Mock Next.js Link
vi.mock('next/link', () => {
    return {
        __esModule: true,
        default: ({ children, href }: { children: React.ReactNode; href: string }) => {
            return <a href={href}>{children}</a>;
        },
    };
});

describe('StartupCard', () => {
    it('renders startup information correctly in grid view', () => {
        render(<StartupCard startup={mockStartup} variant="grid" />);

        expect(screen.getByText('Test Startup')).toBeInTheDocument();
        expect(screen.getByText('Revolutionizing testing')).toBeInTheDocument();
        expect(screen.getByText('SEED')).toBeInTheDocument();
        expect(screen.getByText(/New York/)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('$1M') || content.includes('$1.0M'))).toBeInTheDocument();
    });

    it('renders startup information correctly in list view', () => {
        render(<StartupCard startup={mockStartup} variant="list" />);

        expect(screen.getByText('Test Startup')).toBeInTheDocument();
        expect(screen.getByText('Revolutionizing testing')).toBeInTheDocument();
    });

    it('displays correct funding stage badge color', () => {
        const { container } = render(<StartupCard startup={{ ...mockStartup, fundingStage: 'SERIES_A' }} />);
        const badge = container.querySelector('.bg-blue-100'); // Check for specific class for SERIES_A
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('SERIES A');
    });

    it('links to the correct detail page', () => {
        render(<StartupCard startup={mockStartup} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/startups/1');
    });
});
