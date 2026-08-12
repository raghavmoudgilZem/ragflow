import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput Component', () => {

    it('should render successfully with the default placeholder "Search"', () => {
        render(<SearchInput />);

        const inputElement = screen.getByPlaceholderText('Search');
        expect(inputElement).toBeInTheDocument();
    });

    it('should render successfully with a custom placeholder prop', () => {
        const customPlaceholder = "Search members by name...";
        render(<SearchInput placeholder={customPlaceholder} />);

        const inputElement = screen.getByPlaceholderText(customPlaceholder);
        expect(inputElement).toBeInTheDocument();
    });

    it('should display the controlled value passed through props', () => {
        const testValue = "Veera Workspace";
        render(<SearchInput value={testValue} onChange={vi.fn()} />);

        const inputElement = screen.getByDisplayValue(testValue);
        expect(inputElement).toBeInTheDocument();
        expect((inputElement as HTMLInputElement).value).toBe(testValue);
    });

    it('should trigger the onChange callback handler when a user types', () => {
        const mockOnChange = vi.fn();
        render(<SearchInput onChange={mockOnChange} />);

        const inputElement = screen.getByPlaceholderText('Search');

        fireEvent.change(inputElement, { target: { value: 'Developer' } });

        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should render the decorative Material UI SearchIcon start adornment slot', () => {
        const { container } = render(<SearchInput />);

        const svgIcon = container.querySelector('svg');
        expect(svgIcon).toBeInTheDocument();
    });
});