import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseSwitch } from './BaseSwitch';

describe('BaseSwitch Component Suite', () => {
    it('should render the label when provided', () => {
        render(<BaseSwitch label="Enable Dark Mode" checked={false} onChange={vi.fn()} />);

        // Verify the label renders correctly
        expect(screen.getByText('Enable Dark Mode')).toBeDefined();
    });

    it('should reflect the correct checked state based on the checked prop', () => {
        const { container } = render(<BaseSwitch checked={true} onChange={vi.fn()} />);

        // 💡 Querying the HTML input directly bypasses MUI nested wrappers reliably
        const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(checkbox).not.toBeNull();
        expect(checkbox.checked).toBe(true);

        // Update the prop to false and re-test
        const { container: rerenderedContainer } = render(<BaseSwitch checked={false} onChange={vi.fn()} />);
        const updatedCheckbox = rerenderedContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(updatedCheckbox.checked).toBe(false);
    });

    it('should trigger onChange with the updated boolean value when toggled', () => {
        const mockOnChange = vi.fn();

        // Render starting in an unchecked state
        const { container } = render(<BaseSwitch checked={false} onChange={mockOnChange} />);

        const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(checkbox).not.toBeNull();

        // 💡 MUI updates react via mouse pointer clicks on the input shell.
        // We simulate the click while passing the updated synthetic event target.
        fireEvent.click(checkbox, { target: { checked: true } });

        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

});
