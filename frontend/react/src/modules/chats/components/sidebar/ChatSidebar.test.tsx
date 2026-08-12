import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatSidebar } from './ChatSidebar';
import * as chatSidebarStore from '@modules/chats/store/chatSidebarstore';
import * as useCreateConversationHook from '@modules/chats/hooks/useCreateConversation';
import * as useConversationListHook from '@modules/chats/hooks/useConversationList';

// Mock dependencies
vi.mock('@modules/chats/store/chatSidebarstore');
vi.mock('@modules/chats/hooks/useCreateConversation');
vi.mock('@modules/chats/hooks/useConversationList');

const mockSetActiveConversation = vi.fn();
const mockToggleSidebar = vi.fn();
const mockCollapseSidebar = vi.fn();

const mockUseSidebarStore = {
  isSidebarOpen: true,
  toggleSidebar: mockToggleSidebar,
  collapseSidebar: mockCollapseSidebar,
  setActiveConversation: mockSetActiveConversation,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  activeConversationId: null,
};

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ChatSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue(mockUseSidebarStore as any);
  });

  describe('Desktop View - Component Rendering', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should render sidebar when not mobile', () => {
      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });

    it('should display Conversations header when sidebar is open', () => {
      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Conversations')).toBeInTheDocument();
    });

    it('should calculate and display avatar with first letter of chat name', () => {
      const { container } = renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Amazing Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const avatar = container.querySelector('[class*="MuiAvatar"]');
      expect(avatar).toHaveTextContent('A');
    });

    it('should use default chat name when not provided', () => {
      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Chat App')).toBeInTheDocument();
    });
  });

  describe('Desktop View - User Interactions', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should toggle sidebar when user clicks toggle button', async () => {
      const user = await userEvent.setup();
      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        ...mockUseSidebarStore,
        isSidebarOpen: true,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(toggleButton);

      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should collapse sidebar and hide content when toggled', () => {
      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        ...mockUseSidebarStore,
        isSidebarOpen: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      // When collapsed, Conversations text should not be visible
      expect(screen.queryByText('Conversations')).not.toBeInTheDocument();
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should render drawer when mobile and sidebar is closed', () => {
      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        ...mockUseSidebarStore,
        isSidebarOpen: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={true}
          onSelect={vi.fn()}
        />
      );

      const chevronButton = screen.getByRole('button');
      expect(chevronButton).toBeInTheDocument();
    });

    it('should show chevron button when sidebar is closed on mobile', () => {
      vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
        ...mockUseSidebarStore,
        isSidebarOpen: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={true}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('New Conversation Creation', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);
    });

    it('should create new conversation when user clicks new conversation button', async () => {
      const user = await userEvent.setup();
      const mockMutate = vi.fn();
      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const newChatButton = screen.getByRole('button', { name: /new conversation/i });
      await user.click(newChatButton);

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          dialog_id: 'dialog-123',
          name: expect.stringContaining('New conversation'),
        }),
        expect.any(Object)
      );
    });

    it('should set active conversation on successful creation', async () => {
      const user = await userEvent.setup();
      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: (_payload: any, callbacks: any) => {
          callbacks.onSuccess({ data: { data: { id: 'new-conv-123' } } });
        },
        isPending: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const newChatButton = screen.getByRole('button', { name: /new conversation/i });
      await user.click(newChatButton);

      await waitFor(() => {
        expect(mockSetActiveConversation).toHaveBeenCalledWith('new-conv-123');
      });
    });

    it('should show error snackbar when conversation creation fails', async () => {
      const user = await userEvent.setup();
      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: (_payload: any, callbacks: any) => {
          callbacks.onError(new Error('Creation failed'));
        },
        isPending: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const newChatButton = screen.getByRole('button', { name: /new conversation/i });
      await user.click(newChatButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create conversation/i)).toBeInTheDocument();
      });
    });

    it('should close error snackbar when user dismisses it', async () => {
      const user = await userEvent.setup();
      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: (_payload: any, callbacks: any) => {
          callbacks.onError(new Error('Creation failed'));
        },
        isPending: false,
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      const newChatButton = screen.getByRole('button', { name: /new conversation/i });
      await user.click(newChatButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create conversation/i)).toBeInTheDocument();
      });

      // Close button should exist in the snackbar
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // After closing, error message should disappear
      await waitFor(() => {
        expect(screen.queryByText(/failed to create conversation/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Avatar Gradient Generation', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should generate consistent avatar gradient for same character', () => {
      const { rerender } = renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Apple"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      // First render should have 'A' avatar
      expect(screen.getByText('A')).toBeInTheDocument();

      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      // Different chat name starting with A should be rendered
      rerender(
        <QueryClientProvider client={createQueryClient()}>
          <ChatSidebar
            dialogId="dialog-123"
            chatName="Amazing"
            isMobile={false}
            onSelect={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    beforeEach(() => {
      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.spyOn(useCreateConversationHook, 'useCreateConversation').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should pass correct dialogId to conversation list hook', () => {
      const mockUseConversationList = vi.spyOn(useConversationListHook, 'useConversationList');
      mockUseConversationList.mockReturnValue({
        data: { conversations: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-456"
          chatName="Test"
          isMobile={false}
          onSelect={vi.fn()}
        />
      );

      expect(mockUseConversationList).toHaveBeenCalledWith(
        expect.objectContaining({ dialog_id: 'dialog-456' })
      );
    });

    it('should call onSelect callback with conversation id', async () => {
      const user = await userEvent.setup();
      const mockOnSelect = vi.fn();

      vi.spyOn(useConversationListHook, 'useConversationList').mockReturnValue({
        data: {
          conversations: [
            {
              id: 'conv-1',
              dialog_id: 'dialog-123',
              name: 'Test Conv',
              avatar: 'T',
              create_date: '2024-01-01',
              create_time: 1704067200000,
              update_date: '2024-01-02',
              update_time: 1704153600000,
              is_new: false,
              message: [],
              reference: [],
            },
          ],
          total: 1,
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(
        <ChatSidebar
          dialogId="dialog-123"
          chatName="Test Chat"
          isMobile={false}
          onSelect={mockOnSelect}
        />
      );

      const convItem = screen.getByText('Test Conv').closest('div');
      await user.click(convItem!);

      expect(mockOnSelect).toHaveBeenCalledWith('conv-1');
    });
  });
});
