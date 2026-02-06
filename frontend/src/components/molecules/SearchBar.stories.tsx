import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
    title: 'Molecules/SearchBar',
    component: SearchBar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
    args: {
        placeholder: 'Search startups, investors, or trends...',
        className: 'w-[500px]',
    },
};



export const SpecificPlaceholder: Story = {
    args: {
        ...Default.args,
        placeholder: 'Filter by industry...',
    },
};
