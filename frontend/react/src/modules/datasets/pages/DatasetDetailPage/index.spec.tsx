import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import i18n from '@shared/i18n';
import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgressListResponse } from '../../types/ingestion.types';
import { useDocumentProgress } from '../../hooks/useDocumentProgress';
import DatasetDetailPage from './index';

vi.mock('../../hooks/useDocumentProgress', () => ({
  useDocumentProgress: vi.fn(),
}));

type HookResult = {
  data?: DocumentProgressListResponse;
  isPending: boolean;
  isError: boolean;
};

const mockHook = (result: HookResult) => {
  vi.mocked(useDocumentProgress).mockReturnValue(
    result as unknown as ReturnType<typeof useDocumentProgress>,
  );
};

const response: DocumentProgressListResponse = {
  total: 1,
  docs: [
    {
      id: 'doc-1',
      name: 'invoice.pdf',
      run: IngestionStatus.Running,
      progress: 0.42,
      progress_msg: 'Task dispatched',
      chunk_num: 7,
      token_num: 120,
      process_duration: 4.2,
    },
  ],
};

const renderPage = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/dataset/dataset/kb-1']}>
        <Routes>
          <Route path="/dataset/dataset/:id" element={<DatasetDetailPage />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );

const queryAll = (testId: string) => screen.queryAllByTestId(testId);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DatasetDetailPage', () => {
  it('passes the dataset id from the route to the progress hook', () => {
    mockHook({ data: response, isPending: false, isError: false });

    renderPage();

    expect(useDocumentProgress).toHaveBeenCalledWith('kb-1', {
      page: 1,
      pageSize: 10,
    });
  });

  it('shows skeleton rows while the documents are loading', () => {
    mockHook({ isPending: true, isError: false });

    renderPage();

    expect(queryAll('dataset-detail-skeleton-row').length).toBeGreaterThan(0);
    expect(queryAll('dataset-detail-row')).toHaveLength(0);
  });

  it('renders a row per document with its chunk count and parsing status', () => {
    mockHook({ data: response, isPending: false, isError: false });

    renderPage();

    expect(queryAll('dataset-detail-row')).toHaveLength(1);
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42',
    );
    expect(queryAll('dataset-detail-skeleton-row')).toHaveLength(0);
  });

  it('shows the empty state when the dataset has no documents', () => {
    mockHook({
      data: { total: 0, docs: [] },
      isPending: false,
      isError: false,
    });

    renderPage();

    expect(queryAll('dataset-detail-empty')).toHaveLength(1);
  });

  it('shows an error message when the documents cannot be loaded', () => {
    mockHook({ isPending: false, isError: true });

    renderPage();

    expect(queryAll('dataset-detail-error')).toHaveLength(1);
    expect(queryAll('dataset-detail-empty')).toHaveLength(0);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
