import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScoutWidget } from './ScoutWidget';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useChat from the AI SDK
const mockHandleInputChange = vi.fn();
const mockHandleSubmit = vi.fn((e) => e.preventDefault());

// Create a mutable mock return value
let useChatReturnValue = {
    messages: [],
    input: '',
    handleInputChange: mockHandleInputChange,
    handleSubmit: mockHandleSubmit,
    isLoading: false,
};

vi.mock('@ai-sdk/react', () => ({
    useChat: vi.fn(() => useChatReturnValue),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ScoutWidget', () => {
    beforeEach(() => {
        // Reset mock return value before each test
        useChatReturnValue = {
            messages: [],
            input: '',
            handleInputChange: mockHandleInputChange,
            handleSubmit: mockHandleSubmit,
            isLoading: false,
        };
        vi.clearAllMocks();
    });
    it('renders the FAB initially', () => {
        render(<ScoutWidget />);
        // The FAB usually contains an icon, maybe check for the button role
        const fab = screen.getByRole('button', { name: /toggle chat/i }); // There might be multiple buttons if open, but initially closed
        expect(fab).toBeInTheDocument();
    });

    it('opens the chat window when FAB is clicked', () => {
        render(<ScoutWidget />);
        const fab = screen.getByRole('button', { name: /toggle chat/i });
        fireEvent.click(fab);

        expect(screen.getByText('Startup Scout')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ask anything...')).toBeInTheDocument();
    });

    it('allows typing into the input', () => {
        render(<ScoutWidget />);
        fireEvent.click(screen.getByRole('button', { name: /toggle chat/i })); // Open

        const input = screen.getByPlaceholderText('Ask anything...');
        fireEvent.change(input, { target: { value: 'Hello' } });

        expect(mockHandleInputChange).toHaveBeenCalled();
    });

    it('calls handleSubmit when form is submitted', () => {
        // Override mock to have input value
        useChatReturnValue = {
            messages: [],
            input: 'Hello',
            handleInputChange: mockHandleInputChange,
            handleSubmit: mockHandleSubmit,
            isLoading: false,
        };

        render(<ScoutWidget />);
        fireEvent.click(screen.getByRole('button', { name: /toggle chat/i })); // Open

        // const submitButton = screen.getByLabelText('Send'); // Or use a specific icon selector if needed, but let's try finding by role within form
        // Actually, looking at the component, the submit button has a specific icon.
        // Let's use getByRole('button', { name: '' }) might be tricky if no aria-label.
        // The previous test logic found 3 buttons. Let's make it robust by finding the form first.
        const form = screen.getByPlaceholderText('Ask anything...').closest('form');
        fireEvent.submit(form!);

        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
