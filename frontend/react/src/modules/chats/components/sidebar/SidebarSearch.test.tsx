import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarSearch } from './SidebarSearch';
import * as chatSidebarStore from '@modules/chats/store/chatSidebarstore';

vi.mock('@modules/chats/store/chatSidebarstore');

describe('SidebarSearch', () => {
  let mockSearchTerm = '';
  const mockSetSearchTerm = vi.fn((term: string) => {
    mockSearchTerm = term;
  });

  beforeEach(() => {
    mockSearchTerm = '';
    mockSetSearchTerm.mockClear();
    
    vi.spyOn(chatSidebarStore, 'useSidebarStore').mockImplementation(() => ({
      get searchTerm() { return mockSearchTerm; },
      setSearchTerm: mockSetSearchTerm,
      toggleSidebar: vi.fn(),
      collapseSidebar: vi.fn(),
      setActiveConversation: vi.fn(),
      activeConversationId: null,
      isSidebarOpen: true,
    } as any));
  });

  it('should render search input field', () => {
    render(<SidebarSearch />);

    expect(screen.getByPlaceholderText('Search conversations')).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const { container } = render(<SidebarSearch />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  describe('User Input Behavior', () => {
    it('should update search term when user types', async () => {
      const user = userEvent.setup();

      render(<SidebarSearch />);

      const input = screen.getByPlaceholderText('Search conversations');

      await user.type(input, 't');

      expect(mockSetSearchTerm).toHaveBeenLastCalledWith('t');
    });

    it('should display current search term from store', () => {
      mockSearchTerm = 'existing search term';
      
      render(<SidebarSearch />);

      const input = screen.getByPlaceholderText('Search conversations') as HTMLInputElement;
      expect(input.value).toBe('existing search term');
    });

    it('should clear search when user deletes all text', async () => {
      const user = await userEvent.setup();
      mockSearchTerm = 'test';
      
      const { rerender } = render(<SidebarSearch />);

      const input = screen.getByPlaceholderText('Search conversations') as HTMLInputElement;
      await user.clear(input);

      rerender(<SidebarSearch />);

      expect(mockSetSearchTerm).toHaveBeenCalledWith('');
      expect(mockSearchTerm).toBe('');
    });
  });

  describe('Visual Behavior', () => {
    it('should be full width', () => {
      const { container } = render(<SidebarSearch />);

      const textField = container.querySelector('[class*="MuiTextField"]');
      expect(textField).toHaveStyle({ width: '100%' });
    });

    it('should have input adornment with search icon', () => {
      const { container } = render(<SidebarSearch />);

      const adornment = container.querySelector('[class*="InputAdornment"]');
      expect(adornment).toBeInTheDocument();
    });

    it('should update visual state when search term changes from store', () => {
      mockSearchTerm = '';
      const { rerender } = render(<SidebarSearch />);

      let input = screen.getByPlaceholderText('Search conversations') as HTMLInputElement;
      expect(input.value).toBe('');

      mockSearchTerm = 'new search';
      rerender(<SidebarSearch />);

      input = screen.getByPlaceholderText('Search conversations') as HTMLInputElement;
      expect(input.value).toBe('new search');
    });
  });
});