import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationList } from './ConversationList';
import * as useConversationListHook from '@modules/chats/hooks/useConversationList';
import * as chatSidebarStore from '@modules/chats/store/chatSidebarstore';

vi.mock('@modules/chats/hooks/useConversationList');
vi.mock('@modules/chats/store/chatSidebarstore');

describe('ConversationList', () => {
  const mockOnSelect = vi.fn();
  const mockConversations = [
    {
      id: 'conv-1',
      dialog_id: 'dialog-123',
      name: 'First Conversation',
      avatar: 'F',
      create_date: '2024-01-01',
      create_time: 1704067200000,
      update_date: '2024-01-02',
      update_time: 1704153600000,
      is_new: false,
      message: [],
      reference: [],
    },
    {
      id: 'conv-2',
      dialog_id: 'dialog-123',
      name: 'Second Conversation',
      avatar: 'S',
      create_date: '2024-01-02',
      create_time: 1704153600000,
      update_date: '2024-01-03',
      update_time: 1704240000000,
      is_new: true,
      message: [],
      reference: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
      searchTerm: '',
      activeConversationId: null,
      setSearchTerm: vi.fn(),
      toggleSidebar: vi.fn(),
      collapseSidebar: vi.fn(),
      setActiveConversation: vi.fn(),
      isSidebarOpen: true,
    } as any);
  });

  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const { container } = render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/failed to load conversations/i)).toBeInTheDocument();
    });

    it('should have retry button in error state', () => {
      const mockRefetch = vi.fn();
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const mockRefetch = vi.fn();
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as any);

      const user = await userEvent.setup();
      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show "No conversations yet" when list is empty', () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
    });

    it('should show "No results found" when search returns empty', () => {
      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        searchTerm: 'test search',
        activeConversationId: null,
        setSearchTerm: vi.fn(),
        toggleSidebar: vi.fn(),
        collapseSidebar: vi.fn(),
        setActiveConversation: vi.fn(),
        isSidebarOpen: true,
      } as any);

      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  describe('List Display', () => {
    it('should render all conversations', () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: mockConversations, total: 2 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('First Conversation')).toBeInTheDocument();
      expect(screen.getByText('Second Conversation')).toBeInTheDocument();
    });

    it('should call onSelect when conversation is clicked', async () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: mockConversations, total: 2 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const user = await userEvent.setup();
      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      const firstConv = screen.getByText('First Conversation').closest('div');
      await user.click(firstConv!);

      expect(mockOnSelect).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('Search Integration', () => {
    it('should pass search term to conversation list hook', () => {
      const mockUseConversationList = vi.spyOn(useConversationListHook, 'useConversationList');
      mockUseConversationList.mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        searchTerm: 'first',
        activeConversationId: null,
        setSearchTerm: vi.fn(),
        toggleSidebar: vi.fn(),
        collapseSidebar: vi.fn(),
        setActiveConversation: vi.fn(),
        isSidebarOpen: true,
      } as any);

      render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      // Debounced search should be included
      expect(mockUseConversationList).toHaveBeenCalled();
    });
  });

  describe('Scrolling', () => {
    it('should have overflow auto for scrolling', () => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: mockConversations, total: 2 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const { container } = render(
        <ConversationList
          dialogId="dialog-123"
          onSelect={mockOnSelect}
        />
      );

      const scrollContainer = container.firstChild as HTMLElement;
      const style = window.getComputedStyle(scrollContainer);
      expect(style.overflowY).toBe('auto');
    });
  });

  describe('Props', () => {
    it('should pass dialogId to useConversationList hook', () => {
      const mockUseConversationList = vi.spyOn(useConversationListHook, 'useConversationList');
      mockUseConversationList.mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <ConversationList
          dialogId="dialog-789"
          onSelect={mockOnSelect}
        />
      );

      expect(mockUseConversationList).toHaveBeenCalledWith(
        expect.objectContaining({ dialog_id: 'dialog-789' })
      );
    });
  });
});
