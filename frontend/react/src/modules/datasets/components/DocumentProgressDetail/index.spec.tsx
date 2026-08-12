import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@shared/i18n';
import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgress } from '../../types/ingestion.types';
import { DocumentProgressDetail } from './index';

const buildRecord = (
  overrides: Partial<DocumentProgress> = {},
): DocumentProgress => ({
  id: 'doc-1',
  name: 'invoice.pdf',
  run: IngestionStatus.Done,
  progress: 1,
  progress_msg: 'Task dispatched',
  chunk_num: 3,
  token_num: 120,
  process_duration: 12.4,
  ...overrides,
});

const renderDetail = (record: DocumentProgress) =>
  render(
    <I18nextProvider i18n={i18n}>
      <DocumentProgressDetail record={record} />
    </I18nextProvider>,
  );

describe('DocumentProgressDetail', () => {
  it.each([
    [IngestionStatus.Unstart, 'PENDING'],
    [IngestionStatus.Running, 'PARSING'],
    [IngestionStatus.Cancel, 'CANCELED'],
    [IngestionStatus.Done, 'SUCCESS'],
    [IngestionStatus.Fail, 'FAIL'],
    [IngestionStatus.Schedule, 'SCHEDULE'],
  ])('shows the translated label for status %s', (run, label) => {
    renderDetail(buildRecord({ run }));

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders the process duration with two decimals and a unit', () => {
    renderDetail(buildRecord({ process_duration: 12.4 }));

    expect(screen.getByText('12.40 s')).toBeInTheDocument();
  });

  it('renders the progress message reported by the worker', () => {
    renderDetail(buildRecord({ progress_msg: 'Chunking finished' }));

    expect(screen.getByText('Chunking finished')).toBeInTheDocument();
  });

  it('highlights only the error line and leaves surrounding text plain', () => {
    renderDetail(
      buildRecord({
        run: IngestionStatus.Fail,
        progress_msg: 'Parsing began\n[ERROR] unsupported encoding\nRetrying',
      }),
    );

    const errorSegments = screen.queryAllByTestId(
      'document-progress-error-segment',
    );

    expect(errorSegments).toHaveLength(1);
    expect(errorSegments[0].textContent).toBe('[ERROR] unsupported encoding\n');
  });

  it('renders no error segment when the worker reported no failure', () => {
    renderDetail(buildRecord({ progress_msg: 'Task dispatched' }));

    expect(
      screen.queryByTestId('document-progress-error-segment'),
    ).not.toBeInTheDocument();
  });

  it('renders an empty message when the worker reported nothing', () => {
    renderDetail(buildRecord({ progress_msg: '   ' }));

    expect(screen.getByTestId('document-progress-message')).toHaveTextContent(
      '',
    );
  });
});
