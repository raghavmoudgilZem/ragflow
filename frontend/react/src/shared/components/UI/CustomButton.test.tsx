import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomButton } from './CustomButton';

describe('CustomButton Component Suite', () => {
  it('should render children elements cleanly when the button is active', () => {
    render(<CustomButton>Click Action</CustomButton>);
    
    const buttonNode = screen.getByRole('button', { name: /click action/i });
    expect(buttonNode).toBeDefined();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should render a circular progress loader spinner when isLoading is true', () => {
    render(<CustomButton isLoading={true}>Click Action</CustomButton>);
    
    const buttonNode = screen.getByRole('button');
    expect(buttonNode.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('progressbar')).toBeDefined();
    expect(screen.queryByText(/click action/i)).toBeNull();
  });

  it('should render in a disabled state when the disabled prop is provided', () => {
    render(<CustomButton disabled={true}>Click Action</CustomButton>);
    
    const buttonNode = screen.getByRole('button', { name: /click action/i });
    expect(buttonNode.hasAttribute('disabled')).toBe(true);
  });

  it('should support dynamic form button type modifications and fallbacks', () => {
    const { rerender } = render(<CustomButton type="submit">Submit Form</CustomButton>);
    let buttonNode = screen.getByRole('button', { name: /submit form/i });
    expect(buttonNode.getAttribute('type')).toBe('submit');

    rerender(<CustomButton>Default Form</CustomButton>);
    buttonNode = screen.getByRole('button', { name: /default form/i });
    expect(buttonNode.getAttribute('type')).toBe('button');
  });

  it('should trigger custom onClick callback methods when active actions fire', () => {
    const mockOnClick = vi.fn();
    render(<CustomButton onClick={mockOnClick}>Trigger Click</CustomButton>);
    
    const buttonNode = screen.getByRole('button', { name: /trigger click/i });
    fireEvent.click(buttonNode);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should block onClick interactions completely when loading or disabled states are active', () => {
    const mockOnClick = vi.fn();
    const { rerender } = render(<CustomButton onClick={mockOnClick} isLoading={true}>Trigger Click</CustomButton>);
    
    let buttonNode = screen.getByRole('button');
    fireEvent.click(buttonNode);
    
    rerender(<CustomButton onClick={mockOnClick} disabled={true}>Trigger Click</CustomButton>);
    buttonNode = screen.getByRole('button', { name: /trigger click/i });
    fireEvent.click(buttonNode);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
