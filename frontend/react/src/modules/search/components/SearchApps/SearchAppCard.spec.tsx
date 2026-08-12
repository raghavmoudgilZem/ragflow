import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import SearchAppCard from './SearchAppCard'; // Adjusted path out of __tests__ directory
import type { SearchAppItem } from '../../types/search.types';

// ✅ Fixes the Router invariant context error completely
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('SearchAppCard Component Item Module', () => {
  const mockItem: SearchAppItem = {
    id: 'mock-uuid-12345',
    userId: 'pintu',
    name: 'Production RAG Application Pipeline',
  };
  const mockOnDelete = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('displays the explicit entity configuration properties', () => {
    render(<SearchAppCard item={mockItem} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Production RAG Application Pipeline')).toBeInTheDocument();
    expect(screen.getByText(/mock-uuid-12345/)).toBeInTheDocument();
  });

  it('opens confirmation context modal drawer interface when trash icon is selected', () => {
    render(<SearchAppCard item={mockItem} onDelete={mockOnDelete} />);
    
    const deleteIconButton = screen.getByRole('button', { name: /delete search application/i });
    fireEvent.click(deleteIconButton);
    
    expect(screen.getByText('Delete Search Application?')).toBeInTheDocument();
    expect(screen.getByText(/Permanently delete/i)).toBeInTheDocument();
  });

  it('dispatches the onDelete function with target id parameters on confirm click actions', async () => {
    render(<SearchAppCard item={mockItem} onDelete={mockOnDelete} />);
    
    // Open modal dialog layout layer
    fireEvent.click(screen.getByRole('button', { name: /delete search application/i }));
    
    // Click inner confirmation execution interface button
    const confirmationSubmitBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmationSubmitBtn);
    
    expect(mockOnDelete).toHaveBeenCalledWith('mock-uuid-12345');
    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    // Wait safely for full state animation unmounting
    await waitFor(() => {
      expect(screen.queryByText('Delete Search Application?')).not.toBeInTheDocument();
    });
  });

  it('renders an inline operational loading progress indicator element if isDeleting evaluated true', () => {
    render(<SearchAppCard item={mockItem} onDelete={mockOnDelete} isDeleting={true} />);
    
    // Assert the loading component spinner layout exists
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();
  });
});
