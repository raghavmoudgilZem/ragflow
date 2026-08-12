import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

describe('DeleteConfirmationModal Component', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        targetName: 'Sirisha',
        onConfirm: vi.fn().mockResolvedValue(true),
    };

    it('should render modal content with target text elements when open is true', () => {
        render(<DeleteConfirmationModal {...defaultProps} />);

        expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument();
        expect(screen.getByText('Sirisha')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm remove/i })).toBeInTheDocument();
    });

    it('should not display dialog contents when open is false', () => {
        render(<DeleteConfirmationModal {...defaultProps} open={false} />);

        expect(screen.queryByText('Remove Team Member')).not.toBeInTheDocument();
        expect(screen.queryByText('Sirisha')).not.toBeInTheDocument();
    });

    it('should fire the onClose action when the Cancel button is pressed', () => {
        const mockOnClose = vi.fn();
        render(<DeleteConfirmationModal {...defaultProps} onClose={mockOnClose} />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm and execute onClose upon a successful action confirmation', async () => {
        const mockOnConfirm = vi.fn().mockResolvedValue(true);
        const mockOnClose = vi.fn();

        render(
            <DeleteConfirmationModal
                {...defaultProps}
                onConfirm={mockOnConfirm}
                onClose={mockOnClose}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    it('should call onConfirm but keep modal open if the promise resolves to false', async () => {
        const mockOnConfirm = vi.fn().mockResolvedValue(false);
        const mockOnClose = vi.fn();

        render(
            <DeleteConfirmationModal
                {...defaultProps}
                onConfirm={mockOnConfirm}
                onClose={mockOnClose}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(confirmButton).not.toBeDisabled();
        });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should present a CircularProgress spinner and disable actions during active execution states', async () => {
        let resolvePromise: (value: boolean) => void = () => { };

        const mockOnConfirm = vi.fn().mockImplementation(() => {
            return new Promise<boolean>((resolve) => {
                resolvePromise = resolve;
            });
        });

        render(<DeleteConfirmationModal {...defaultProps} onConfirm={mockOnConfirm} />);

        const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        fireEvent.click(confirmButton);

        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        resolvePromise(true);
        await waitFor(() => {
            expect(confirmButton).not.toBeDisabled();
        });
    });

    it('should intercept click events and suppress form submission bubbling', async () => {
        const mockOnConfirm = vi.fn().mockResolvedValue(true);
        render(<DeleteConfirmationModal {...defaultProps} onConfirm={mockOnConfirm} />);

        const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
        const clickEvent = fireEvent.click(confirmButton);

        expect(clickEvent).toBe(false);

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalled();
        });
    });
});