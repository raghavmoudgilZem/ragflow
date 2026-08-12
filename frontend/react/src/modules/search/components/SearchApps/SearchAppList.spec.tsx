import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchAppList from './SearchAppList';
import type { SearchAppItem } from '../../types/search.types';

// ✅ Fixes the Router invariant context error for all child cards
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

describe('SearchAppList Layout Grid Component', () => {
  const mockItems: SearchAppItem[] = [
    { id: '1', userId: 'pintu', name: 'Alpha Search Engine Config' },
    { id: '2', userId: 'pintu', name: 'Beta Vector Cluster Recipe' },
  ];

  const mockProps = {
    items: mockItems,
    totalItems: 2,
    totalPages: 3,
    currentPage: 1,
    onPageChange: vi.fn(),
    searchQuery: '',
    setQuery: vi.fn(),
    setIsModalOpen: vi.fn(),
    isDeleting: false,
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps all collection entries directly as discrete child cards', () => {
    render(<SearchAppList {...mockProps} />);

    expect(screen.getByText('Alpha Search Engine Config')).toBeInTheDocument();
    expect(screen.getByText('Beta Vector Cluster Recipe')).toBeInTheDocument();
  });

  it('dispatches the query callback interface when writing inside search controls', () => {
    render(<SearchAppList {...mockProps} />);

    const inputField = screen.getByPlaceholderText(/search configurations.../i);
    fireEvent.change(inputField, { target: { value: 'Cluster' } });

    expect(mockProps.setQuery).toHaveBeenCalledWith('Cluster');
    expect(mockProps.setQuery).toHaveBeenCalledTimes(1);
  });

  it('fires creation modal toggle methods when tapping header action button layout components', () => {
    render(<SearchAppList {...mockProps} />);

    const createBtn = screen.getByRole('button', { name: /create app/i });
    fireEvent.click(createBtn);

    expect(mockProps.setIsModalOpen).toHaveBeenCalledWith(true);
    expect(mockProps.setIsModalOpen).toHaveBeenCalledTimes(1);
  });

  it('dispatches the page mutation method when pagination index indicators are pushed', () => {
    render(<SearchAppList {...mockProps} />);

    const pageTwoButton = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(pageTwoButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
    expect(mockProps.onPageChange).toHaveBeenCalledTimes(1);
  });

  it('renders an empty grid layout without crashing when the item array is completely blank', () => {
    const { container } = render(
      <SearchAppList {...mockProps} items={[]} totalItems={0} totalPages={0} />
    );
    
    // 1. Locate the container grid that usually holds child cards
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();

    // 2. Query for any instance of a SearchAppCard subcomponent structure or its grid cells
    // Since items array is empty, no cells should be spawned inside the grid wrapper
    const childGridItems = gridContainer?.children;
    expect(childGridItems?.length).toBe(0);
  });

});
