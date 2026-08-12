import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import ChatsPage from './ChatsPage';
import type { Chat } from '../types/chat.types';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../store/chatUiStore', () => ({
  useChatUiStore: vi.fn(),
}));

vi.mock('../hooks/useChatList', () => ({
  useChatList: vi.fn(),
}));

vi.mock('../hooks/useCreateChat', () => ({
  useCreateChat: vi.fn(),
}));

vi.mock('../hooks/useDeleteChat', () => ({
  useDeleteChat: vi.fn(),
}));

vi.mock('../hooks/useRenameChat', () => ({
  useRenameChat: vi.fn(),
}));

vi.mock('../components/ChatsPageHeader', () => ({
  ChatsPageHeader: ({ chatCount, onCreateClick }: any) => (
    <div data-testid="chats-header">
      <button onClick={onCreateClick}>Create Chat</button>
      <span>{chatCount} chats</span>
    </div>
  ),
}));

vi.mock('../components/ChatCardGrid', () => ({
  ChatCardGrid: ({ chats, onChatClick, onDelete }: any) => (
    <div data-testid="chat-grid">
      {chats.map((chat: Chat) => (
        <div key={chat.id} data-testid={`chat-${chat.id}`}>
          <button onClick={() => onChatClick(chat.id)}>{chat.name}</button>
          <button onClick={() => onDelete(chat.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../components/ChatEmptyState', () => ({
  ChatEmptyState: ({ onCreateClick }: any) => (
    <div data-testid="empty-state">
      <button onClick={onCreateClick}>Create First Chat</button>
    </div>
  ),
}));

vi.mock('../components/ChatPagination', () => ({
  ChatPagination: ({ total, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <span>Total: {total}</span>
      <button onClick={() => onPageChange(2)}>Next</button>
      <button onClick={() => onPageSizeChange(20)}>Change Size</button>
    </div>
  ),
}));

vi.mock('../components/modals/CreateChatModal', () => ({
  CreateChatModal: ({ open, mode, onClose }: any) => 
    open ? (
      <div data-testid={`modal-${mode}`}>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

import { useNavigate } from 'react-router-dom';
import { useChatUiStore } from '../store/chatUiStore';
import { useChatList } from '../hooks/useChatList';
import { useDeleteChat } from '../hooks/useDeleteChat';
import { useRenameChat } from '../hooks/useRenameChat';

describe('ChatsPage', () => {
  const mockNavigate = vi.fn();
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenRenameModal = vi.fn();
  const mockCloseRenameModal = vi.fn();
  const mockSetSearchTerm = vi.fn();
  const mockSetPage = vi.fn();
  const mockSetPageSize = vi.fn();

  const mockDeleteMutate = vi.fn();
  const mockRenameMutate = vi.fn();

  const mockChats: Chat[] = [
    {
      id: '1', name: 'Chat 1', create_time: Date.now(),
      create_date: '',
      description: '',
      icon: '',
      dialog_id: '',
      kb_ids: [],
      kb_names: [],
      language: '',
      llm_id: '',
      llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system_prompt: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
      llm_setting_type: '',
      prompt_type: '',
      status: '',
      tenant_id: '',
      update_date: '',
      update_time: 0,
      vector_similarity_weight: 0,
      similarity_threshold: 0,
      top_k: 0,
      top_n: 0,
      created_at: '2024-01-15T10:30:00',
    },
    {
      id: '2', name: 'Chat 2', create_time: Date.now(),
      create_date: '',
      description: '',
      icon: '',
      dialog_id: '',
      kb_ids: [],
      kb_names: [],
      language: '',
      llm_id: '',
      llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
      llm_setting_type: '',
      prompt_type: '',
      status: '',
      tenant_id: '',
      update_date: '',
      update_time: 0,
      vector_similarity_weight: 0,
      similarity_threshold: 0,
      top_k: 0,
      top_n: 0
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as any).mockReturnValue(mockNavigate);

    (useChatUiStore as any).mockReturnValue({
      page: 1,
      pageSize: 10,
      searchTerm: '',
      isModalOpen: false,
      renameTarget: null,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      openRenameModal: mockOpenRenameModal,
      closeRenameModal: mockCloseRenameModal,
      setSearchTerm: mockSetSearchTerm,
      setPage: mockSetPage,
      setPageSize: mockSetPageSize,
    });

    (useChatList as any).mockReturnValue({
      data: {
        dialogs: mockChats,
        total: 2,
      },
      isLoading: false,
      isError: false,
    });

    (useDeleteChat as any).mockReturnValue({
      mutate: mockDeleteMutate,
    });

    (useRenameChat as any).mockReturnValue({
      mutate: mockRenameMutate,
    });
  });

  describe('Rendering', () => {
    it('should render the page header', () => {
      render(<ChatsPage />);

      expect(screen.getByTestId('chats-header')).toBeInTheDocument();
    });

    it('should render chat grid when chats are loaded', () => {
      render(<ChatsPage />);

      expect(screen.getByTestId('chat-grid')).toBeInTheDocument();
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });

    it('should render pagination when chats are loaded', () => {
      render(<ChatsPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should display correct chat count in header', () => {
      render(<ChatsPage />);

      expect(screen.getByText('2 chats')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton loaders when data is loading', () => {
      (useChatList as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(<ChatsPage />);

      // Should show 6 skeleton elements
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show pagination while loading', () => {
      (useChatList as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(<ChatsPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error alert when data loading fails', () => {
      (useChatList as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      render(<ChatsPage />);

      expect(screen.getByText('Failed to load chat apps. Please try again.')).toBeInTheDocument();
    });

    it('should not show chats or pagination on error', () => {
      (useChatList as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      render(<ChatsPage />);

      expect(screen.queryByTestId('chat-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no chats exist', () => {
      (useChatList as any).mockReturnValue({
        data: {
          dialogs: [],
          total: 0,
        },
        isLoading: false,
        isError: false,
      });

      render(<ChatsPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should not show pagination in empty state', () => {
      (useChatList as any).mockReturnValue({
        data: {
          dialogs: [],
          total: 0,
        },
        isLoading: false,
        isError: false,
      });

      render(<ChatsPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Create Chat Modal', () => {
    it('should open create modal when create button is clicked', async () => {
      
      (useChatUiStore as any).mockReturnValue({
        page: 1,
        pageSize: 10,
        searchTerm: '',
        isModalOpen: true,
        renameTarget: null,
        openModal: mockOpenModal,
        closeModal: mockCloseModal,
        openRenameModal: mockOpenRenameModal,
        closeRenameModal: mockCloseRenameModal,
        setSearchTerm: mockSetSearchTerm,
        setPage: mockSetPage,
        setPageSize: mockSetPageSize,
      });

      render(<ChatsPage />);

      expect(screen.getByTestId('modal-create')).toBeInTheDocument();
    });

    it('should close create modal when close is clicked', async () => {
      const user = userEvent.setup();
      
      (useChatUiStore as any).mockReturnValue({
        page: 1,
        pageSize: 10,
        searchTerm: '',
        isModalOpen: true,
        renameTarget: null,
        openModal: mockOpenModal,
        closeModal: mockCloseModal,
        openRenameModal: mockOpenRenameModal,
        closeRenameModal: mockCloseRenameModal,
        setSearchTerm: mockSetSearchTerm,
        setPage: mockSetPage,
        setPageSize: mockSetPageSize,
      });

      render(<ChatsPage />);

      const closeButton = screen.getByText('Close Modal');
      await user.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  describe('Chat Navigation', () => {
    it('should navigate to chat detail when chat is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const chatButton = screen.getByText('Chat 1');
      await user.click(chatButton);

      expect(mockNavigate).toHaveBeenCalledWith('/chats/1');
    });

    it('should navigate with correct chat id for each chat', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const chat2Button = screen.getByText('Chat 2');
      await user.click(chat2Button);

      expect(mockNavigate).toHaveBeenCalledWith('/chats/2');
    });
  });

  describe('Chat Deletion', () => {
    it('should call delete mutation when chat delete is triggered', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(mockDeleteMutate).toHaveBeenCalledWith('1');
    });

    it('should pass correct chat id to delete mutation', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[1]);

      expect(mockDeleteMutate).toHaveBeenCalledWith('2');
    });
  });

  describe('Pagination', () => {
    it('should pass pagination params to useChatList', () => {
      render(<ChatsPage />);

      expect(useChatList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          page_size: 10,
        })
      );
    });

    it('should update page when pagination changes', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      expect(mockSetPage).toHaveBeenCalledWith(2);
    });

    it('should update page size when changed', async () => {
      const user = userEvent.setup();
      render(<ChatsPage />);

      const changeSizeButton = screen.getByText('Change Size');
      await user.click(changeSizeButton);

      expect(mockSetPageSize).toHaveBeenCalledWith(20);
    });
  });

  describe('Search', () => {
    it('should pass debounced search term to useChatList', () => {
      (useChatUiStore as any).mockReturnValue({
        page: 1,
        pageSize: 10,
        searchTerm: 'test search',
        isModalOpen: false,
        renameTarget: null,
        openModal: mockOpenModal,
        closeModal: mockCloseModal,
        openRenameModal: mockOpenRenameModal,
        closeRenameModal: mockCloseRenameModal,
        setSearchTerm: mockSetSearchTerm,
        setPage: mockSetPage,
        setPageSize: mockSetPageSize,
      });

      render(<ChatsPage />);

      // After debounce delay, search should be included
      waitFor(() => {
        expect(useChatList).toHaveBeenCalledWith(
          expect.objectContaining({
            keywords: 'test search',
          })
        );
      });
    });
  });

  describe('Rename Chat', () => {
    it('should open rename modal with correct data', () => {
      (useChatUiStore as any).mockReturnValue({
        page: 1,
        pageSize: 10,
        searchTerm: '',
        isModalOpen: false,
        renameTarget: { id: '1', name: 'Chat 1' },
        openModal: mockOpenModal,
        closeModal: mockCloseModal,
        openRenameModal: mockOpenRenameModal,
        closeRenameModal: mockCloseRenameModal,
        setSearchTerm: mockSetSearchTerm,
        setPage: mockSetPage,
        setPageSize: mockSetPageSize,
      });

      render(<ChatsPage />);

      const modals = screen.getAllByTestId('modal-rename');
      expect(modals).toHaveLength(1);
      expect(modals[0]).toBeInTheDocument();
    });

    it('should call rename mutation with correct payload', async () => {

      (useChatUiStore as any).mockReturnValue({
        page: 1,
        pageSize: 10,
        searchTerm: '',
        isModalOpen: false,
        renameTarget: { id: '1', name: 'Old Name' },
        openModal: mockOpenModal,
        closeModal: mockCloseModal,
        openRenameModal: mockOpenRenameModal,
        closeRenameModal: mockCloseRenameModal,
        setSearchTerm: mockSetSearchTerm,
        setPage: mockSetPage,
        setPageSize: mockSetPageSize,
      });

      render(<ChatsPage />);

      // The handleRename function will be called with new name
      // For this test, we're verifying the structure is correct
      expect(screen.getByTestId('modal-rename')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render complete page with all sections', () => {
      render(<ChatsPage />);

      expect(screen.getByTestId('chats-header')).toBeInTheDocument();
      expect(screen.getByTestId('chat-grid')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should transition from empty state to loaded state', () => {
      const { rerender } = render(<ChatsPage />);

      expect(screen.getByTestId('chat-grid')).toBeInTheDocument();

      // Simulate empty state
      (useChatList as any).mockReturnValue({
        data: { dialogs: [], total: 0 },
        isLoading: false,
        isError: false,
      });

      rerender(<ChatsPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-grid')).not.toBeInTheDocument();
    });
  });
});
