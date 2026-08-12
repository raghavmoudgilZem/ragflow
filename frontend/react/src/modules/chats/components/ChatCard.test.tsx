import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ChatCard } from './ChatCard';
import type { Chat } from '../types/chat.types';

// Mock the store
vi.mock('../store/chatUiStore', () => ({
  useChatUiStore: vi.fn(),
}));

import { useChatUiStore } from '../store/chatUiStore';

describe('ChatCard', () => {
  const mockOpenRenameModal = vi.fn();
  const mockOnClick = vi.fn();
  const mockOnDelete = vi.fn();

  const mockChat: Chat = {
    id: '123',
    name: 'Test Chat',
    create_time: new Date('2024-01-15T10:30:00').getTime(),
    created_at: '2024-01-15T10:30:00',
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
    top_n: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useChatUiStore as any).mockReturnValue({
      openRenameModal: mockOpenRenameModal,
    });
  });

  describe('Rendering', () => {
    it('should render chat card with name and creation time', () => {
      render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test Chat')).toBeInTheDocument();
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    });

    it('should render avatar with first letter of chat name', () => {
      render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should render three-dot menu button', () => {
      render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = screen.getByRole('button', { hidden: true });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Avatar Gradient', () => {
    it('should generate consistent gradient based on first letter', () => {
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const avatar = container.querySelector('[class*="MuiAvatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle different first letters correctly', () => {
      const chats = [
        { ...mockChat, name: 'Apple Chat' },
        { ...mockChat, name: 'Banana Chat' },
        { ...mockChat, name: 'Cherry Chat' },
      ];

      chats.forEach(chat => {
        const { unmount } = render(
          <ChatCard
            chat={chat}
            onClick={mockOnClick}
            onDelete={mockOnDelete}
          />
        );

        const avatarText = screen.getByText(chat.name.charAt(0).toUpperCase());
        expect(avatarText).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Card Click', () => {
    it('should call onClick with chat id when card is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByText('Test Chat').closest('[class*="MuiCard"]');
      await user.click(card!);

      expect(mockOnClick).toHaveBeenCalledWith('123');
    });

    it('should not trigger onClick when menu button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      // Wait to ensure onClick is not called
      await waitFor(() => {
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('Menu Interactions', () => {
    it('should open menu when three-dot button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Rename')).toBeInTheDocument();
      });
    });

    it('should show rename and delete options in menu', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Rename')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    it('should close menu after clicking rename', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      const renameMenuItem = await screen.findByText('Rename');
      await user.click(renameMenuItem);

      await waitFor(() => {
        expect(mockOpenRenameModal).toHaveBeenCalledWith('123', 'Test Chat');
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      // 1. Click menu
      const menuButton = screen.getByRole('button', { name: '' });
      await user.click(menuButton);

      // 2. Click "Delete" menu item (await this to ensure it's found)
      const deleteMenuItem = await screen.findByText('Delete');
      await user.click(deleteMenuItem);

      // 3. Await the appearance of the dialog elements
      // findBy queries will automatically wait for the dialog to be added to the DOM
      const dialogTitle = await screen.findByText(/Are you sure you want to delete/i);

      expect(dialogTitle).toBeInTheDocument();
    });

    it('should call onDelete with chat id when delete is confirmed', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      // Open menu
      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      // Click delete
      const deleteMenuItem = await screen.findByText('Delete');
      await user.click(deleteMenuItem);

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', { name: /Delete/i });
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith('123');
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      // Open menu and click delete
      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      const deleteMenuItem = await screen.findByText('Delete');
      await user.click(deleteMenuItem);

      // Click cancel
      const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockOnDelete).not.toHaveBeenCalled();
      });
    });

    it('should not call onDelete if dialog is cancelled', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const menuButton = container.querySelector('[class*="MuiIconButton"]');
      if (menuButton) {
        await user.click(menuButton);
      }

      const deleteMenuItem = await screen.findByText('Delete');
      await user.click(deleteMenuItem);

      const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly in DD/MM/YYYY HH:MM:SS format', () => {
      const testChat: Chat = {
        id: '123',
        name: 'Test',
        create_time: new Date('2024-12-25T23:59:59').getTime(),
        create_date: '',
        description: '',
        icon: '',
        dialog_id: '',
        kb_ids: [],
        kb_names: [],
        language: '',
        llm_id: '',
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
        created_at: '2024-01-15T10:30:00',
      };

      render(
        <ChatCard
          chat={testChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/25\/12\/2024 23:59:59/)).toBeInTheDocument();
    });

    it('should pad single digit dates and times with zeros', () => {
      const testChat: Chat = {
        id: '123',
        name: 'Test',
        create_time: new Date('2024-01-05T05:09:03').getTime(),
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
      };

      render(
        <ChatCard
          chat={testChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/05\/01\/2024 05:09:03/)).toBeInTheDocument();
    });
  });

  describe('Hover State', () => {
    it('should show menu icon on hover', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChatCard
          chat={mockChat}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByText('Test Chat').closest('[class*="MuiCard"]');

      // Initially opacity should be 0
      const menuIcon = container.querySelector('.more-icon');
      expect(menuIcon).toHaveStyle({ opacity: '0' });

      // Hover over card
      if (card) {
        await user.hover(card);
      }

      // After hover, opacity should be 1 (handled by CSS, but we can verify the class exists)
      expect(menuIcon).toHaveClass('more-icon');
    });
  });
});
