import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
    title: 'Atoms/Avatar',
    component: Avatar,
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
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    args: {
        src: 'https://ui-avatars.com/api/?name=Neural+Flow&background=6366f1&color=fff',
        alt: 'Neural Flow',
        fallback: 'NF',
        size: 'md',
    },
};

export const Small: Story = {
    args: {
        ...Default.args,
        size: 'sm',
    },
};

export const Large: Story = {
    args: {
        ...Default.args,
        size: 'lg',
    },
};

export const ExtraLarge: Story = {
    args: {
        ...Default.args,
        size: 'xl',
    },
};

export const Fallback: Story = {
    args: {
        src: '',
        fallback: 'JD',
        size: 'md',
    },
};
