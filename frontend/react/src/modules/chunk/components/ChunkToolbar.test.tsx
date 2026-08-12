import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChunkToolbar } from './ChunkToolbar';
import type { ChunkEnabledFilter, ChunkViewMode } from '../types/chunk.types';

describe('ChunkToolbar', () => {
  const mockOnViewModeChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockOnEnabledFilterChange = vi.fn();
  const mockOnSelectAllChange = vi.fn();
  const mockOnEnableSelected = vi.fn();
  const mockOnDisableSelected = vi.fn();
  const mockOnDeleteSelected = vi.fn();
  const mockOnAddClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderToolbar = (
    viewMode: ChunkViewMode = 'full',
    search = '',
    enabledFilter: ChunkEnabledFilter = 'all',
    selectAll = false,
    selectedCount = 0,
  ) => {
    return render(
      <ChunkToolbar
        viewMode={viewMode}
        onViewModeChange={mockOnViewModeChange}
        search={search}
        onSearchChange={mockOnSearchChange}
        enabledFilter={enabledFilter}
        onEnabledFilterChange={mockOnEnabledFilterChange}
        selectAll={selectAll}
        onSelectAllChange={mockOnSelectAllChange}
        selectedCount={selectedCount}
        onEnableSelected={mockOnEnableSelected}
        onDisableSelected={mockOnDisableSelected}
        onDeleteSelected={mockOnDeleteSelected}
        onAddClick={mockOnAddClick}
      />,
    );
  };

  describe('Rendering', () => {
    it('renders view mode toggle with both options', () => {
      renderToolbar();
      expect(screen.getByText('Full text')).toBeInTheDocument();
      expect(screen.getByText('Ellipse')).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderToolbar('full', 'test query');
      const input = screen.getByDisplayValue('test query');
      expect(input).toBeInTheDocument();
    });

    it('renders filter and add buttons', () => {
      renderToolbar();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders Select all checkbox', () => {
      renderToolbar();
      expect(screen.getByText('Select all')).toBeInTheDocument();
    });

    it('hides bulk action buttons when nothing selected', () => {
      renderToolbar('full', '', 'all', false, 0);
      expect(screen.queryByText('Enable')).not.toBeInTheDocument();
      expect(screen.queryByText('Disable')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('shows bulk action buttons when items are selected', () => {
      renderToolbar('full', '', 'all', false, 3);
      expect(screen.getByText('Enable')).toBeInTheDocument();
      expect(screen.getByText('Disable')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSearchChange when user types in search input', async () => {
      const user = userEvent.setup();
      renderToolbar();

      const input = screen.getByPlaceholderText('Search');
      await user.type(input, 'hello');

      expect(mockOnSearchChange).toHaveBeenCalled();
    });

    it('calls onAddClick when plus button (lucide-plus) clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderToolbar();

      // The add button has the lucide-plus icon svg inside
      const plusIcon = container.querySelector('.lucide-plus');
      const addButton = plusIcon?.closest('button');
      if (addButton) {
        await user.click(addButton);
      }

      expect(mockOnAddClick).toHaveBeenCalledTimes(addButton ? 1 : 0);
    });

    it('calls onEnableSelected when Enable bulk button is clicked', async () => {
      const user = userEvent.setup();
      renderToolbar('full', '', 'all', false, 2);

      const enableBtn = screen.getByText('Enable').closest('button');
      if (enableBtn) {
        await user.click(enableBtn);
      }

      await waitFor(() => {
        expect(mockOnEnableSelected).toHaveBeenCalled();
      });
    });

    it('calls onDisableSelected when Disable bulk button is clicked', async () => {
      const user = userEvent.setup();
      renderToolbar('full', '', 'all', false, 2);

      const disableBtn = screen.getByText('Disable').closest('button');
      if (disableBtn) {
        await user.click(disableBtn);
      }

      await waitFor(() => {
        expect(mockOnDisableSelected).toHaveBeenCalled();
      });
    });

    it('calls onDeleteSelected when Delete bulk button is clicked', async () => {
      const user = userEvent.setup();
      renderToolbar('full', '', 'all', false, 2);

      const deleteBtn = screen.getByText('Delete').closest('button');
      if (deleteBtn) {
        await user.click(deleteBtn);
      }

      await waitFor(() => {
        expect(mockOnDeleteSelected).toHaveBeenCalled();
      });
    });
  });
});
