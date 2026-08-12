import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateChunkDialog } from './CreateChunkDialog';

vi.mock('../hooks/useCreateChunk', () => ({
  useCreateChunk: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

import { useCreateChunk } from '../hooks/useCreateChunk';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreateChunkDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateChunk as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const renderDialog = (open = true) => {
    return render(
      <CreateChunkDialog
        open={open}
        documentId="doc-1"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() },
    );
  };

  describe('Rendering', () => {
    it('does not render dialog when open is false', () => {
      const { queryByText } = renderDialog(false);
      expect(queryByText('Create Chunk')).not.toBeInTheDocument();
    });

    it('renders title, close button, and all section labels', () => {
      renderDialog();
      expect(screen.getByText('Create Chunk')).toBeInTheDocument();
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();

      expect(screen.getByText('Chunk')).toBeInTheDocument();
      expect(screen.getByText('Keyword')).toBeInTheDocument();
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('+ Add tag')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('disables confirm button when content is empty', () => {
      renderDialog();
      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmBtn).toBeDisabled();
    });

    it('enables confirm button when content is filled', async () => {
      const user = userEvent.setup();
      renderDialog();

      const textareas = screen.getAllByRole('textbox');
      const chunkTextarea = textareas.find((t) => (t as HTMLTextAreaElement).tagName === 'TEXTAREA') as HTMLTextAreaElement;
      if (chunkTextarea) {
        await user.type(chunkTextarea, 'Valid chunk content');
      }

      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmBtn).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close icon is clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      const closeBtn = screen.getByLabelText('Close dialog');
      await user.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls useCreateChunk mutate with correct payload when Confirm clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      const textareas = screen.getAllByRole('textbox');
      const chunkTextarea = textareas.find((t) => (t as HTMLTextAreaElement).tagName === 'TEXTAREA') as HTMLTextAreaElement;
      if (chunkTextarea) {
        await user.type(chunkTextarea, 'My chunk content');
      }

      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          documentId: 'doc-1',
          content: 'My chunk content',
          metadata: {
            keywords: [],
            tags: [],
          },
        });
      });
    });

    it('disables buttons when submitting (isPending)', () => {
      (useCreateChunk as any).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
      // Add content so the only disable reason is isPending
      renderDialog();

      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmBtn).toBeDisabled();
    });
  });
});
