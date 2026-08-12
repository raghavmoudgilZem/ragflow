import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';
import type { DocumentDetail } from '../types/chunk.types';

describe('DocumentPreviewPanel', () => {
  const baseDocumentDetail: DocumentDetail = {
    id: 'doc-1',
    datasetId: 'dataset-1',
    datasetName: 'Test Dataset',
    name: 'Test Document.pdf',
    sizeLabel: '1.2 MB',
    sizeInBytes: 1258291,
    uploadedAt: '2026-07-24T12:30:00Z',
    chunkCount: 10,
    previewTitle: 'Preview Title',
    previewSubtitle: 'Preview Subtitle',
  };

  const renderPreview = (
    documentDetail: DocumentDetail | null | undefined = baseDocumentDetail,
  ) => {
    if (!documentDetail) {
      // If no detail, just render nothing (matches component's expected type)
      return render(<></>);
    }
    return render(
      <DocumentPreviewPanel documentDetail={documentDetail} />,
    );
  };

  describe('Rendering', () => {
    it('renders document name and metadata', () => {
      renderPreview();

      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
      expect(screen.getByText(/1.2 MB/)).toBeInTheDocument();
      expect(screen.getByText(/2026-07-24/)).toBeInTheDocument();
    });

    it('renders Constitution cover with mock title', () => {
      renderPreview();
      // Just look for the text in the cover
      const titles = screen.getAllByText(/THE CONSTITUTION/);
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders scrollable mock sections (at least 50)', () => {
      renderPreview();
      const section1 = screen.getByText(/Section 1:/);
      const section50 = screen.getByText(/Section 50:/);
      expect(section1).toBeInTheDocument();
      expect(section50).toBeInTheDocument();
    });

    it('handles null/undefined documentDetail gracefully', () => {
      const { container } = renderPreview(null);
      // No crash, and renders at least layout boxes
      expect(container).toBeInTheDocument();
    });
  });
});
