import type { Meta, StoryObj } from '@storybook/react';
import { IconWrapper } from './IconWrapper';
import { ActivityIcon, ZapIcon, TrendingUpIcon } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof IconWrapper> = {
    title: 'Atoms/IconWrapper',
    component: IconWrapper,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        variant: {
            control: 'select',
            options: ['default', 'primary', 'success', 'warning', 'danger'],

        },
    },
};

export default meta;
type Story = StoryObj<typeof IconWrapper>;

export const Default: Story = {
    args: {
        children: <ActivityIcon className="h-5 w-5" />,
        variant: 'primary',
        size: 'md',
    },
};

export const LargeAccent: Story = {
    args: {
        children: <ZapIcon className="h-6 w-6" />,
        variant: 'warning',

        size: 'lg',
    },
};

export const SmallSuccess: Story = {
    args: {
        children: <TrendingUpIcon className="h-4 w-4" />,
        variant: 'success',
        size: 'sm',
    },
};
