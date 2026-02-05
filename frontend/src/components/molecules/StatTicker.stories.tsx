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
        trend: '+12.5%',
        trendType: 'up',
        icon: <DollarSignIcon className="h-5 w-5" />,
        variant: 'primary',
    },
};

export const Users: Story = {
    args: {
        label: 'Active Investors',
        value: '25,000+',
        trend: '+5.2%',
        trendType: 'up',
        icon: <UsersIcon className="h-5 w-5" />,
        variant: 'success',
    },
};

export const Growth: Story = {
    args: {
        label: 'Market Growth',
        value: '+24%',
        trend: '+8.1%',
        trendType: 'up',
        icon: <TrendingUpIcon className="h-5 w-5" />,
        variant: 'accent',
    },
};
