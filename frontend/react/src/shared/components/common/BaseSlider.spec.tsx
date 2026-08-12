import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseSlider } from './BaseSlider';

// Mocking the BaseTooltip just in case it relies on complex external logic/contexts
vi.mock('./BaseToolTip', () => ({
    BaseTooltip: () => <span data-testid="mock-tooltip">Tooltip</span>
}));

describe('BaseSlider Component Suite', () => {
    it('should render the label and default formatted value (toFixed(1))', () => {
        render(<BaseSlider label="Threshold" value={0.5} onChange={vi.fn()} />);

        // Verify the label renders
        expect(screen.getByText('Threshold')).toBeDefined();
        
        // Verify the fallback format uses toFixed(1)
        expect(screen.getByText('0.5')).toBeDefined();
    });

    it('should render a custom displayValue when provided', () => {
        render(
            <BaseSlider 
                value={0.8} 
                onChange={vi.fn()} 
                displayValue="80%" 
            />
        );

        // Verify it overrides the toFixed(1) default
        expect(screen.getByText('80%')).toBeDefined();
    });

    it('should render child elements when provided (for sub-labels)', () => {
        render(
            <BaseSlider value={0.5} onChange={vi.fn()}>
                <span data-testid="sub-label">Vector vs Keyword</span>
            </BaseSlider>
        );

        expect(screen.getByTestId('sub-label')).toBeDefined();
        expect(screen.getByText('Vector vs Keyword')).toBeDefined();
    });

    it('should trigger onChange with the new numeric value when dragged', () => {
        const mockOnChange = vi.fn();
        render(<BaseSlider value={0.2} min={0} max={1} step={0.1} onChange={mockOnChange} />);

        // MUI Slider renders an accessible <input type="range" role="slider" />
        const sliderInput = screen.getByRole('slider');
        
        // Simulate a user dragging the slider to 0.7
        fireEvent.change(sliderInput, { target: { value: '0.7' } });

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(0.7);
    });

    it('should disable the slider when disabled prop is true', () => {
        render(<BaseSlider value={0.5} disabled={true} onChange={vi.fn()} />);

        const sliderInput = screen.getByRole('slider');
        // HTML inputs represent disabled states with the disabled property
        expect((sliderInput as HTMLInputElement).disabled).toBe(true);
    });
});