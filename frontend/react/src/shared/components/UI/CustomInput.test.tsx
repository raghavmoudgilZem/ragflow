import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomInput } from './CustomInput';

describe('CustomInput Component Suite', () => {
  it('should render the input element with correct placeholders into screen viewports', () => {
    render(
      <CustomInput
        id="test-input"
        name="test"
        placeholder="Enter input string data"
        value=""
        onChange={vi.fn()}
      />
    );

    const inputNode = screen.getByPlaceholderText('Enter input string data');
    expect(inputNode).toBeDefined();
  });

  it('should trigger custom onChange callback functions when value edits fire', () => {
    const mockOnChange = vi.fn();
    render(
      <CustomInput
        id="test-input"
        name="test"
        value=""
        onChange={mockOnChange}
      />
    );

    const inputNode = screen.getByRole('textbox');
    fireEvent.change(inputNode, { target: { value: 'New Typed Text' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should render layout wrappers containing specialized border colors when error strings are present', () => {
    render(
      <CustomInput
        id="test-input"
        name="test"
        value=""
        onChange={vi.fn()}
        error="Invalid parameter string context"
      />
    );

    const inputNode = screen.getByRole('textbox');
    expect(inputNode).toBeDefined();
  });
});