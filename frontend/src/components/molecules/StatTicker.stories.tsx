import type { Meta, StoryObj } from '@storybook/react';
import { StatTicker } from './StatTicker';
import { TrendingUpIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof StatTicker> = {
    title: 'Molecules/StatTicker',
    component: StatTicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatTicker>;

export const Funding: Story = {
    args: {
        label: 'Total Funding',
        value: '$45.2M',
        change: '+12.5%',
        trend: 'up',
        icon: <DollarSignIcon className="h-5 w-5" />,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
    },
};

export const Users: Story = {
    args: {
        label: 'Active Investors',
        value: '25,000+',
        change: '+5.2%',
        trend: 'up',
        icon: <UsersIcon className="h-5 w-5" />,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
    },
};

export const Growth: Story = {
    args: {
        label: 'Market Growth',
        value: '+24%',
        change: '+8.1%',
        trend: 'up',
        icon: <TrendingUpIcon className="h-5 w-5" />,
        iconColor: 'text-purple-600',
        iconBgColor: 'bg-purple-100',
    },
};
