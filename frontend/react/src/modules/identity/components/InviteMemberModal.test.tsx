import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { InviteMemberModal } from './InviteMemberModal';

describe('InviteMemberModal Component', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onInviteSubmit: vi.fn().mockResolvedValue(true),
    };

    it('should render all form layout elements accurately when open is true', () => {
        render(<InviteMemberModal {...defaultProps} />);

        expect(screen.getByText('Add')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
    });

    it('should completely hide the dialog container when open is false', () => {
        render(<InviteMemberModal {...defaultProps} open={false} />);

        expect(screen.queryByText('Add')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    });

    it('should trigger onClose when the Cancel button is clicked', () => {
        const mockOnClose = vi.fn();
        render(<InviteMemberModal {...defaultProps} onClose={mockOnClose} />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClose when the top header close icon is clicked', () => {
        const mockOnClose = vi.fn();
        render(<InviteMemberModal {...defaultProps} onClose={mockOnClose} />);

        const closeIconButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeIconButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display a validation message if the user clicks Ok with an empty input', async () => {
        render(<InviteMemberModal {...defaultProps} />);

        const submitButton = screen.getByRole('button', { name: /ok/i });
        fireEvent.click(submitButton);

        const errorMessage = await screen.findByText('Email field cannot be evaluated as blank');
        expect(errorMessage).toBeInTheDocument();
        expect(defaultProps.onInviteSubmit).not.toHaveBeenCalled();
    });

    it('should display an error validation message for poorly formatted email schemas', async () => {
        render(<InviteMemberModal {...defaultProps} />);

        const inputField = screen.getByPlaceholderText('Email');
        fireEvent.change(inputField, { target: { value: 'malformed_email_format' } });

        const submitButton = screen.getByRole('button', { name: /ok/i });
        fireEvent.click(submitButton);

        const errorMessage = await screen.findByText('Invalid email');
        expect(errorMessage).toBeInTheDocument();
        expect(defaultProps.onInviteSubmit).not.toHaveBeenCalled();
    });

    it('should process submit event cleanly and execute close procedures on API success', async () => {
        const mockOnInviteSubmit = vi.fn().mockResolvedValue(true);
        const mockOnClose = vi.fn();

        render(
            <InviteMemberModal
                {...defaultProps}
                onInviteSubmit={mockOnInviteSubmit}
                onClose={mockOnClose}
            />
        );

        const inputField = screen.getByPlaceholderText('Email');
        fireEvent.change(inputField, { target: { value: 'testuser@zemosolabs.com' } });

        const submitButton = screen.getByRole('button', { name: /ok/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnInviteSubmit).toHaveBeenCalledWith('testuser@zemosolabs.com');
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        expect((inputField as HTMLInputElement).value).toBe('');
    });

    it('should keep form open on screen layers if the handler updates resolve as false', async () => {
        const mockOnInviteSubmit = vi.fn().mockResolvedValue(false);
        const mockOnClose = vi.fn();

        render(
            <InviteMemberModal
                {...defaultProps}
                onInviteSubmit={mockOnInviteSubmit}
                onClose={mockOnClose}
            />
        );

        const inputField = screen.getByPlaceholderText('Email');
        fireEvent.change(inputField, { target: { value: 'duplicate@zemosolabs.com' } });

        const submitButton = screen.getByRole('button', { name: /ok/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnInviteSubmit).toHaveBeenCalledWith('duplicate@zemosolabs.com');
        });

        expect(mockOnClose).not.toHaveBeenCalled();
        expect((inputField as HTMLInputElement).value).toBe('duplicate@zemosolabs.com');
    });
});