import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChunkPagination } from './ChunkPagination';

describe('ChunkPagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  const renderPagination = (
    totalItems = 100,
    page = 1,
    totalPages = 10,
    pageSize = 10,
  ) => {
    return render(
      <ChunkPagination
        totalItems={totalItems}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />,
    );
  };

  describe('Rendering', () => {
    it('renders total items label', () => {
      renderPagination(123);
      expect(screen.getByText('Total 123')).toBeInTheDocument();
    });

    it('renders pagination controls', () => {
      renderPagination();
      const pageButtons = screen.getAllByRole('button');
      expect(pageButtons.length).toBeGreaterThan(0);
    });

    it('renders page size combobox (native select)', () => {
      renderPagination();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('keeps pagination visible with 0 items (safeTotalPages)', () => {
      renderPagination(0, 1, 0, 10);
      const totalLabel = screen.getByText('Total 0');
      expect(totalLabel).toBeInTheDocument();
      const pageButtons = screen.getAllByRole('button');
      expect(pageButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('calls onPageChange when page button clicked', async () => {
      const user = userEvent.setup();
      renderPagination(100, 1, 5, 20);

      const page2Button = screen.getByText('2');
      if (page2Button) {
        await user.click(page2Button);
      }

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageSizeChange when page size is changed', async () => {
      const user = userEvent.setup();
      renderPagination(100, 1, 5, 10);

      const select = screen.getByRole('combobox');
      await user.click(select);

      // Now the menu is open, find and click the 20 /Page option
      const option = await screen.findByText('20 /Page');
      await user.click(option);

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
    });
  });
});
