import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseDropdown } from './BaseDropdown';

describe('BaseDropdown Component Suite', () => {
  it('should display the placeholder text when no value is selected', () => {
    render(<BaseDropdown value="" onChange={vi.fn()} items={[]} />);
    
    // MUI Select renders the selected text (or placeholder) inside a div
    expect(screen.getByText('Select an option...')).toBeDefined();
  });

  it('should display the optional header label when provided', () => {
    render(<BaseDropdown label="Status Filter" value="" onChange={vi.fn()} items={[]} />);
    
    expect(screen.getByText('Status Filter')).toBeDefined();
  });

  it('should render the correct label when a value matches an object item', () => {
    const objectItems = [
      { label: 'Published', value: 'pub' },
      { label: 'Draft', value: 'drf' }
    ];
    
    render(<BaseDropdown value="drf" onChange={vi.fn()} items={objectItems} />);
    
    // 'renderValue' should output the label "Draft" based on the value "drf"
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('should trigger onChange with the correct value when a primitive string item is selected', () => {
    const mockOnChange = vi.fn();
    const stringItems = ['Apple', 'Banana', 'Orange'];
    
    render(<BaseDropdown value="" onChange={mockOnChange} items={stringItems} />);
    
    // 1. Open the MUI dropdown menu (MUI Selects use mouseDown to open)
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    
    // 2. Find and click the specific option in the portal listbox
    const optionNode = screen.getByRole('option', { name: 'Banana' });
    fireEvent.click(optionNode);
    
    // 3. Verify the callback received the exact value
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('Banana');
  });

  it('should trigger onChange with the correct value when an object item is selected', () => {
    const mockOnChange = vi.fn();
    const objectItems = [
      { label: 'Admin', value: 100 },
      { label: 'User', value: 200 }
    ];
    
    render(<BaseDropdown value="" onChange={mockOnChange} items={objectItems} />);
    
    // 1. Open the dropdown
    fireEvent.mouseDown(screen.getByRole('combobox'));
    
    // 2. Click the option by its display label
    const optionNode = screen.getByRole('option', { name: 'Admin' });
    fireEvent.click(optionNode);
    
    // 3. Verify the callback received the numeric value, not the label
    expect(mockOnChange).toHaveBeenCalledWith(100);
  });
});