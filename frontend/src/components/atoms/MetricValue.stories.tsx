import type { Meta, StoryObj } from '@storybook/react';
import { MetricValue } from './MetricValue';

const meta: Meta<typeof MetricValue> = {
    title: 'Atoms/MetricValue',
    component: MetricValue,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
        },

    },
};

export default meta;
type Story = StoryObj<typeof MetricValue>;

export const Default: Story = {
    args: {
        value: '$45.2M',
        label: 'Total Funding',
        size: 'md',
    },
};

export const TrendingUp: Story = {
    args: {
        value: '+124%',
        label: 'User Growth',
        size: 'lg',
    },
};

export const TrendingDown: Story = {
    args: {
        value: '-12%',
        label: 'Churn Rate',
        size: 'md',
    },
};

export const Large: Story = {
    args: {
        value: '10,000+',
        label: 'Startups Tracked',
        size: 'xl',
    },
};
