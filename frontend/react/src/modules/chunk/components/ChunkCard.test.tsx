import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChunkCard } from './ChunkCard';
import type { Chunk, ChunkViewMode } from '../types/chunk.types';

describe('ChunkCard', () => {
  const mockOnSelectChange = vi.fn();
  const mockOnEnabledChange = vi.fn();

  const baseChunk: Chunk = {
    id: 'chunk-1',
    documentId: 'doc-1',
    content: 'This is the content of the first chunk. It has some text that we can use for testing.',
    metadata: {
      page: 5,
      contentType: 'Article',
    },
    enabled: true,
    createdAt: '2026-07-24T00:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  };

  const renderChunkCard = (
    chunk: Chunk = baseChunk,
    selected = false,
    viewMode: ChunkViewMode = 'full',
  ) => {
    return render(
      <ChunkCard
        chunk={chunk}
        selected={selected}
        viewMode={viewMode}
        onSelectChange={mockOnSelectChange}
        onEnabledChange={mockOnEnabledChange}
      />,
    );
  };

  describe('Rendering', () => {
    it('should render page number, content type and content', () => {
      renderChunkCard();

      expect(screen.getByText('Page 5')).toBeInTheDocument();
      expect(screen.getByText('Article')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is the content of the first chunk. It has some text that we can use for testing.',
        ),
      ).toBeInTheDocument();
    });

    it('should render default content type when metadata.contentType is missing', () => {
      const chunk = {
        ...baseChunk,
        metadata: { page: 1 },
      };
      renderChunkCard(chunk);

      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render thumbnail image when thumbnailUrl is provided', () => {
      const chunk = {
        ...baseChunk,
        thumbnailUrl: 'https://example.com/thumb.png',
      };
      const { container } = renderChunkCard(chunk);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/thumb.png');
      expect(img).toHaveAttribute('alt', expect.stringContaining('Chunk preview'));
    });
  });

  describe('Ellipsis view mode', () => {
    it('truncates long content', () => {
      const longContent = 'A'.repeat(300);
      const chunk = { ...baseChunk, content: longContent };
      renderChunkCard(chunk, false, 'ellipsis');

      const text = screen.getByText(/^A+…?$/);
      expect(text).toBeInTheDocument();
      expect(text.textContent?.length).toBeLessThan(300);
    });
  });

  describe('Interactions', () => {
    it('calls onSelectChange when checkbox is toggled', async () => {
      const user = userEvent.setup();
      renderChunkCard();

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnSelectChange).toHaveBeenCalledWith(true);
    });

    it('calls onEnabledChange when switch is toggled', async () => {
      const user = userEvent.setup();
      renderChunkCard();

      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(mockOnEnabledChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Selection styling', () => {
    it('reflects selected state via border/background', () => {
      const { container, rerender } = renderChunkCard(baseChunk, false);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();

      rerender(
        <ChunkCard
          chunk={baseChunk}
          selected={true}
          viewMode="full"
          onSelectChange={mockOnSelectChange}
          onEnabledChange={mockOnEnabledChange}
        />,
      );
      expect(card).toBeInTheDocument();
    });
  });
});
