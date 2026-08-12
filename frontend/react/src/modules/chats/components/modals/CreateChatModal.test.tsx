import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateChatModal } from './CreateChatModal';

// Mock the dependencies
vi.mock('../../hooks/useCreateChat', () => ({
  useCreateChat: vi.fn(),
}));

vi.mock('@modules/chats/types/chat.types', () => ({
  CreateChatModalProps: {},
}));

import { useCreateChat } from '../../hooks/useCreateChat';

describe('CreateChatModal', () => {
  const mockOnClose = vi.fn();
  const mockOnRename = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateChat as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe('Create Mode', () => {
    it('should render the modal with create title when mode is create', () => {
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Create chat')).toBeInTheDocument();
    });

    it('should render the modal with rename title when mode is rename', () => {
      render(
        <CreateChatModal
          mode="rename"
          open={true}
          onClose={mockOnClose}
          initialName="Old Name"
          onRename={mockOnRename}
        />
      );

      expect(screen.getByText('Rename chat')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<CreateChatModal mode="create" open={false} onClose={mockOnClose} />);
      // The dialog is removed from DOM when not open
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('close dialog');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('should disable save button when name field is empty', async () => {
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when name is entered', async () => {
      const user = userEvent.setup();
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText('Please input name') as HTMLInputElement;
      await user.type(input, 'New Chat');

      const saveButton = screen.getByText('Save');
      expect(saveButton).not.toBeDisabled();
    });

    it('should show error message when name is cleared after being filled', async () => {
      const user = userEvent.setup();
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText('Please input name') as HTMLInputElement;
      
      // Type and then clear
      await user.type(input, 'New Chat');
      await user.clear(input);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Create Chat', () => {
    it('should call createChat.mutate with correct payload on form submit', async () => {
      const user = userEvent.setup();
      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText('Please input name');
      const saveButton = screen.getByText('Save');

      await user.type(input, 'Test Chat');
      await user.click(saveButton);

      expect(mockMutate).toHaveBeenCalledWith(
        { name: 'Test Chat' },
        expect.any(Object)
      );
    });

    it('should close modal on successful chat creation', async () => {
      const user = userEvent.setup(); // Call this once per test
      
      (useCreateChat as any).mockReturnValue({
        mutate: (_payload: any, callbacks: any) => callbacks.onSuccess(),
        isPending: false,
      });

      render(<CreateChatModal mode="create" open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText('Please input name');
      const saveButton = screen.getByText('Save');

      await user.type(input, 'Test Chat');
      await user.click(saveButton); // Direct usage, no .then()

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show error snackbar on creation failure', async () => {
      const user = userEvent.setup(); // Initialize once
      
      (useCreateChat as any).mockReturnValue({
        mutate: (_payload: any, callbacks: any) => callbacks.onError(),
        isPending: false,
      });

      render(<CreateChatModal mode="create" open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText('Please input name');
      const saveButton = screen.getByText('Save');

      await user.type(input, 'Test Chat');
      await user.click(saveButton); // Directly use the user instance

      await waitFor(() => {
        expect(screen.getByText('Failed to create chat. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Rename Chat', () => {
    it('should call onRename with correct payload in rename mode', async () => {
      const user = userEvent.setup();
      render(
        <CreateChatModal
          mode="rename"
          open={true}
          onClose={mockOnClose}
          initialName="Old Name"
          onRename={mockOnRename}
        />
      );

      const input = screen.getByDisplayValue('Old Name') as HTMLInputElement;
      
      // Clear and type new name
      await user.clear(input);
      await user.type(input, 'New Name');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockOnRename).toHaveBeenCalledWith(
        'New Name',
        expect.any(Object)
      );
    });

    it('should show error snackbar on rename failure', async () => {
      const user = userEvent.setup();
      
      mockOnRename.mockImplementation((_name: string, callbacks: any) => {
        callbacks.onError();
      });

      render(
        <CreateChatModal
          mode="rename"
          open={true}
          onClose={mockOnClose}
          initialName="Old Name"
          onRename={mockOnRename}
        />
      );

      const input = screen.getByDisplayValue('Old Name');
      const saveButton = screen.getByText('Save');

      await user.clear(input);
      await user.type(input, 'New Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to rename chat. Please try again.')).toBeInTheDocument();
      });
    });

    it('should disable save button when name hasn\'t changed', async () => {
      render(
        <CreateChatModal
          mode="rename"
          open={true}
          onClose={mockOnClose}
          initialName="Same Name"
          onRename={mockOnRename}
        />
      );

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner on save button when mutating', () => {
      (useCreateChat as any).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(
        <CreateChatModal
          mode="create"
          open={true}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when modal is reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CreateChatModal mode="create" open={true} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('Please input name') as HTMLInputElement;
      
      await user.type(input, 'Test'); // Removed .then()
      expect(input.value).toBe('Test');

      // Close modal
      rerender(<CreateChatModal mode="create" open={false} onClose={mockOnClose} />);
      
      // Reopen modal
      rerender(<CreateChatModal mode="create" open={true} onClose={mockOnClose} />);

      const newInput = screen.getByPlaceholderText('Please input name') as HTMLInputElement;
      expect(newInput.value).toBe('');
    });
  });
});
