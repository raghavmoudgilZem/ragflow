import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditPasswordModal } from './EditPasswordModal';

describe('EditPasswordModal Component', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders password input fields when open', () => {
        render(<EditPasswordModal {...defaultProps} />);

        expect(screen.getByRole('heading', { name: /Edit Password/i })).toBeInTheDocument();
        expect(screen.getByText(/^Current password$/i)).toBeInTheDocument();
        expect(screen.getByText(/^New password$/i)).toBeInTheDocument();
        expect(screen.getByText(/^Confirm new password$/i)).toBeInTheDocument();
    });

    it('toggles password visibility icons when clicked', () => {
        render(<EditPasswordModal {...defaultProps} />);

        const inputs = screen.getAllByPlaceholderText('Password');

        expect(inputs[0]).toHaveAttribute('type', 'password');
        expect(inputs[1]).toHaveAttribute('type', 'password');
        expect(inputs[2]).toHaveAttribute('type', 'password');

        const buttons = screen.getAllByRole('button');
        const eyeButtons = buttons.filter((btn) => btn.querySelector('svg[data-testid="VisibilityIcon"]'));

        expect(eyeButtons.length).toBe(3);

        fireEvent.click(eyeButtons[0]);
        expect(inputs[0]).toHaveAttribute('type', 'text');

        fireEvent.click(eyeButtons[1]);
        expect(inputs[1]).toHaveAttribute('type', 'text');

        fireEvent.click(eyeButtons[2]);
        expect(inputs[2]).toHaveAttribute('type', 'text');

        // Toggle back to password
        const eyeOffButtons = buttons.filter((btn) => btn.querySelector('svg[data-testid="VisibilityOffIcon"]'));
        fireEvent.click(eyeOffButtons[0]);
        expect(inputs[0]).toHaveAttribute('type', 'password');
    });

    it('prevents form submission on empty password fields', async () => {
        render(<EditPasswordModal {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
    });

    it('calls onSave with input passwords and closes modal when valid and onSave returns true', async () => {
        defaultProps.onSave.mockResolvedValueOnce(true);

        render(<EditPasswordModal {...defaultProps} />);

        const inputs = screen.getAllByPlaceholderText('Password');
        fireEvent.change(inputs[0], { target: { value: 'Password123' } });
        fireEvent.change(inputs[1], { target: { value: 'NewPass123!' } });
        fireEvent.change(inputs[2], { target: { value: 'NewPass123!' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(defaultProps.onSave).toHaveBeenCalledWith('Password123', 'NewPass123!');
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('shows API error message if onSave returns false', async () => {
        defaultProps.onSave.mockResolvedValueOnce(false);

        render(<EditPasswordModal {...defaultProps} />);

        const inputs = screen.getAllByPlaceholderText('Password');
        fireEvent.change(inputs[0], { target: { value: 'Password123' } });
        fireEvent.change(inputs[1], { target: { value: 'NewPass123!' } });
        fireEvent.change(inputs[2], { target: { value: 'NewPass123!' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to change password. Please check your current password.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('shows unexpected error message if onSave throws an exception', async () => {
        defaultProps.onSave.mockRejectedValueOnce(new Error('Unexpected Exception'));

        render(<EditPasswordModal {...defaultProps} />);

        const inputs = screen.getAllByPlaceholderText('Password');
        fireEvent.change(inputs[0], { target: { value: 'Password123' } });
        fireEvent.change(inputs[1], { target: { value: 'NewPass123!' } });
        fireEvent.change(inputs[2], { target: { value: 'NewPass123!' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(<EditPasswordModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});