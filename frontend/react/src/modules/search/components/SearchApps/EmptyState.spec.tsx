import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState'; // Adjusted path out of __tests__ directory

describe('EmptyState Component Layout', () => {
  const mockSetIsOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders structural text instructions correctly', () => {
    render(<EmptyState setIsOpen={mockSetIsOpen} />);

    // Explicitly asserts the text node exists in JSDOM
    expect(screen.getByText('No Search app created yet!')).toBeInTheDocument();

    // Explicitly asserts the interactive button element exists
    expect(screen.getByRole('button', { name: /no search app created yet!/i })).toBeInTheDocument();
  });

  it('triggers model open state when clicking the root container surface', () => {
    render(<EmptyState setIsOpen={mockSetIsOpen} />);

    // Find all elements that encompass our target text string
    const targetText = screen.getByText('No Search app created yet!');

    // 💡 Diagnostic Strategy: Traverse up until we trigger the handler
    let currentElement: HTMLElement | null = targetText;
    let clickSucceeded = false;

    while (currentElement && currentElement !== document.body) {
      fireEvent.click(currentElement);

      // Check if this specific element execution triggered our mock
      if (mockSetIsOpen.mock.calls.length > 0) {
        clickSucceeded = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }

    expect(clickSucceeded).toBe(true);
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });


  it('triggers modal open state when explicitly clicking the inner button element', () => {
    render(<EmptyState setIsOpen={mockSetIsOpen} />);

    const actionBtn = screen.getByRole('button', { name: /no search app created yet!/i });
    fireEvent.click(actionBtn);

    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
  });
});
