import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';

import i18n from '@shared/i18n';
import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgress } from '../../types/ingestion.types';
import { DocumentParsingStatus } from './index';

const buildRecord = (
  overrides: Partial<DocumentProgress> = {},
): DocumentProgress => ({
  id: 'doc-1',
  name: 'invoice.pdf',
  run: IngestionStatus.Running,
  progress: 0.42,
  progress_msg: 'Task dispatched',
  chunk_num: 3,
  token_num: 120,
  process_duration: 4.2,
  ...overrides,
});

const renderCell = (record: DocumentProgress) =>
  render(
    <I18nextProvider i18n={i18n}>
      <DocumentParsingStatus record={record} />
    </I18nextProvider>,
  );

const queryDetail = () => screen.queryByTestId('document-progress-detail');

const queryErrorSegment = () =>
  screen.queryByTestId('document-progress-error-segment');

const queryDot = () => screen.queryByTestId('status-dot');

describe('DocumentParsingStatus', () => {
  it('renders a progress bar and percent while the document is parsing', () => {
    renderCell(buildRecord({ run: IngestionStatus.Running, progress: 0.42 }));

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42',
    );
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('does not label the parsing row, matching the source cell', () => {
    renderCell(buildRecord({ run: IngestionStatus.Running, progress: 0.42 }));

    expect(screen.queryByText('PARSING')).not.toBeInTheDocument();
  });

  it.each([
    [IngestionStatus.Unstart],
    [IngestionStatus.Schedule],
    [IngestionStatus.Cancel],
    [IngestionStatus.Done],
    [IngestionStatus.Fail],
  ])('renders only a status dot for non-parsing status %s', (run) => {
    renderCell(buildRecord({ run, progress: 0.5 }));

    expect(queryDot()).not.toBeNull();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('keeps the progress detail hidden until the status is clicked', () => {
    renderCell(buildRecord());

    expect(queryDetail()).toBeNull();
  });

  it('opens the progress detail popover with the failure message on click', async () => {
    const user = userEvent.setup();
    renderCell(
      buildRecord({
        run: IngestionStatus.Fail,
        progress_msg: 'Parsing began\n[ERROR] unsupported encoding\n',
      }),
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => expect(queryDetail()).not.toBeNull());
    expect(queryErrorSegment()?.textContent).toContain(
      '[ERROR] unsupported encoding',
    );
  });

  it('does not render the raw failure text inline in the row', () => {
    renderCell(
      buildRecord({
        run: IngestionStatus.Fail,
        progress_msg: '[ERROR] unsupported encoding',
      }),
    );

    expect(
      screen.queryByText(/unsupported encoding/),
    ).not.toBeInTheDocument();
  });
});
