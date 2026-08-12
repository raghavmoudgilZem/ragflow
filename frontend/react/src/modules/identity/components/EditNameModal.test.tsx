import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditNameModal } from './EditNameModal';

describe('EditNameModal Component', () => {
    const defaultProps = {
        open: true,
        currentName: 'Veera',
        onClose: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders current name in input when open', () => {
        render(<EditNameModal {...defaultProps} />);

        expect(screen.getByRole('heading', { name: /Edit Name/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Veera')).toBeInTheDocument();
    });

    it('shows error message if name input is empty on form submit', async () => {
        render(<EditNameModal {...defaultProps} />);

        const input = screen.getByDisplayValue('Veera');
        fireEvent.change(input, { target: { value: '   ' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Please input your username!')).toBeInTheDocument();
        });
        expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('clears error message when typing into the input field', async () => {
        render(<EditNameModal {...defaultProps} />);

        const input = screen.getByDisplayValue('Veera');
        fireEvent.change(input, { target: { value: '' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Please input your username!')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: 'VeeraUpdated' } });

        expect(screen.queryByText('Please input your username!')).not.toBeInTheDocument();
    });

    it('calls onSave and onClose on successful form submission', async () => {
        defaultProps.onSave.mockResolvedValueOnce(true);

        render(<EditNameModal {...defaultProps} />);

        const input = screen.getByDisplayValue('Veera');
        fireEvent.change(input, { target: { value: 'VeeraNew' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(defaultProps.onSave).toHaveBeenCalledWith('VeeraNew');
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('displays error message when onSave returns false', async () => {
        defaultProps.onSave.mockResolvedValueOnce(false);

        render(<EditNameModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to update name. Please try again.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('displays fallback error message when onSave throws an exception', async () => {
        defaultProps.onSave.mockRejectedValueOnce(new Error('Network error'));

        render(<EditNameModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onClose when Cancel or Close icon is clicked', () => {
        render(<EditNameModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});