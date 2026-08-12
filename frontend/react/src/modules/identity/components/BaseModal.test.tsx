import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BaseModal } from './BaseModal';

describe('BaseModal Component', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        title: 'Test Modal Header',
        children: <div data-testid="modal-child-content">Child Form Content</div>,
    };

    it('renders modal title and children when open is true', () => {
        render(<BaseModal {...defaultProps} />);

        expect(screen.getByText('Test Modal Header')).toBeInTheDocument();
        expect(screen.getByTestId('modal-child-content')).toBeInTheDocument();
    });

    it('does not render content when open is false', () => {
        render(<BaseModal {...defaultProps} open={false} />);

        expect(screen.queryByText('Test Modal Header')).not.toBeInTheDocument();
        expect(screen.queryByTestId('modal-child-content')).not.toBeInTheDocument();
    });

    it('calls onClose when close icon button or cancel button is clicked', () => {
        render(<BaseModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

        const closeIconButton = screen.getByTestId('CloseIcon').closest('button');
        if (closeIconButton) {
            fireEvent.click(closeIconButton);
            expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
        }
    });

    it('calls onSubmit when form submit button is clicked', () => {
        const handleSubmit = vi.fn((e) => e.preventDefault());
        render(
            <BaseModal {...defaultProps} onSubmit={handleSubmit} submitLabel="Save Changes">
                <input type="text" defaultValue="test" />
            </BaseModal>
        );

        const submitButton = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(submitButton);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('disables submit button and close icon while submitting', () => {
        const handleSubmit = vi.fn();
        render(
            <BaseModal {...defaultProps} onSubmit={handleSubmit} isSubmitting={true}>
                <div>Content</div>
            </BaseModal>
        );

        const submitButton = screen.getByRole('button', { name: /Saving.../i });
        expect(submitButton).toBeDisabled();

        const closeIconButton = screen.getByTestId('CloseIcon').closest('button');
        expect(closeIconButton).toBeDisabled();
    });

    it('disables submit button when isDisabled is true', () => {
        const handleSubmit = vi.fn();
        render(
            <BaseModal {...defaultProps} onSubmit={handleSubmit} isDisabled={true}>
                <div>Content</div>
            </BaseModal>
        );

        const submitButton = screen.getByRole('button', { name: /Save/i });
        expect(submitButton).toBeDisabled();
    });
});