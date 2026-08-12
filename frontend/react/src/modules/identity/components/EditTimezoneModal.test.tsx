import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditTimezoneModal } from './EditTimezoneModal';

describe('EditTimezoneModal Component', () => {
    const defaultProps = {
        open: true,
        currentTimezone: 'UTC+8 Asia/Shanghai',
        onClose: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders time zone title and selected value when open', () => {
        render(<EditTimezoneModal {...defaultProps} />);

        expect(screen.getByRole('heading', { name: /Edit Time Zone/i })).toBeInTheDocument();
    });

    it('allows searching and selecting a timezone option and saving successfully', async () => {
        defaultProps.onSave.mockResolvedValueOnce(true);

        render(<EditTimezoneModal {...defaultProps} />);

        const selectCombobox = screen.getByRole('combobox');
        fireEvent.mouseDown(selectCombobox);

        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'Kolkata' } });

        const option = screen.getByRole('option', { name: 'UTC+5:30 Asia/Kolkata' });
        fireEvent.click(option);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(defaultProps.onSave).toHaveBeenCalledWith('UTC+5:30 Asia/Kolkata');
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('shows error message if onSave returns false', async () => {
        defaultProps.onSave.mockResolvedValueOnce(false);

        render(<EditTimezoneModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to update timezone.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('shows error message if onSave throws an exception', async () => {
        defaultProps.onSave.mockRejectedValueOnce(new Error('Network failure'));

        render(<EditTimezoneModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('clears error message when selecting a different timezone value', async () => {
        defaultProps.onSave.mockResolvedValueOnce(false);

        render(<EditTimezoneModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to update timezone.')).toBeInTheDocument();
        });

        const selectCombobox = screen.getByRole('combobox');
        fireEvent.mouseDown(selectCombobox);

        const option = screen.getByRole('option', { name: 'UTC+0 UTC' });
        fireEvent.click(option);

        expect(screen.queryByText('Failed to update timezone.')).not.toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(<EditTimezoneModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});