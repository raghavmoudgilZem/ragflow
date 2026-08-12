import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IngestionStatus } from '@modules/datasets/types/ingestion.types';
import { JobProgress } from './index';

describe('JobProgress', () => {
  it('renders the running state with a labelled determinate bar and percent', () => {
    render(<JobProgress status={IngestionStatus.Running} progress={0.42} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('PARSING')).toBeInTheDocument();
  });

  it.each([
    [IngestionStatus.Unstart, 'PENDING', 'colorPrimary'],
    [IngestionStatus.Schedule, 'SCHEDULE', 'colorInfo'],
    [IngestionStatus.Running, 'PARSING', 'colorInfo'],
    [IngestionStatus.Cancel, 'CANCELED', 'colorWarning'],
    [IngestionStatus.Done, 'SUCCESS', 'colorSuccess'],
    [IngestionStatus.Fail, 'FAIL', 'colorError'],
  ])(
    'maps status %s to label "%s" and tone class %s',
    (status, label, toneClass) => {
      render(<JobProgress status={status} progress={0.5} />);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveClass(
        `MuiLinearProgress-${toneClass}`,
      );
    },
  );

  it('keeps two decimals of precision so the bar matches the source UI', () => {
    render(<JobProgress status={IngestionStatus.Running} progress={0.0707} />);

    expect(screen.getByText('7.07%')).toBeInTheDocument();
  });

  it('drops trailing zeros from a whole percent', () => {
    render(<JobProgress status={IngestionStatus.Running} progress={0.5} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('falls back to a readable label when the worker reports an unknown status', () => {
    render(<JobProgress status={'9' as IngestionStatus} progress={0.5} />);

    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows the percent text only for active states', () => {
    render(<JobProgress status={IngestionStatus.Schedule} progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('hides the percent text for terminal states', () => {
    render(<JobProgress status={IngestionStatus.Done} progress={1} />);
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
  });

  it('forces a full bar when the job is done regardless of progress', () => {
    render(<JobProgress status={IngestionStatus.Done} progress={0.7} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('clamps progress above one to a full bar', () => {
    render(<JobProgress status={IngestionStatus.Running} progress={1.5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('renders a zero bar for a failed job and never advances the value', () => {
    render(<JobProgress status={IngestionStatus.Fail} progress={-1} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('treats a non-finite progress value as zero', () => {
    render(
      <JobProgress status={IngestionStatus.Running} progress={Number.NaN} />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('shows the worker failure message in the error state', () => {
    render(
      <JobProgress
        status={IngestionStatus.Fail}
        progress={-1}
        errorMessage="Tokenizer ran out of memory"
      />,
    );
    expect(screen.getByText('Tokenizer ran out of memory')).toBeInTheDocument();
  });

  it('falls back to the status label and never shows a generic error word when no message is present', () => {
    render(<JobProgress status={IngestionStatus.Fail} progress={-1} />);
    expect(screen.getByText('FAIL')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('job-progress-error')).not.toBeInTheDocument();
  });

  it('does not render a failure message for non-failed states', () => {
    render(
      <JobProgress
        status={IngestionStatus.Running}
        progress={0.5}
        errorMessage="should not show"
      />,
    );
    expect(screen.queryByText('should not show')).not.toBeInTheDocument();
    expect(screen.queryByTestId('job-progress-error')).not.toBeInTheDocument();
  });

  it('lets a caller override the label for localisation', () => {
    render(
      <JobProgress
        status={IngestionStatus.Running}
        progress={0.5}
        label="解析中"
      />,
    );
    expect(screen.getByText('解析中')).toBeInTheDocument();
    expect(screen.queryByText('PARSING')).not.toBeInTheDocument();
  });

  it('applies a custom data-testid to the root and its parts', () => {
    render(
      <JobProgress
        status={IngestionStatus.Running}
        progress={0.5}
        data-testid="doc-progress"
      />,
    );
    expect(screen.getByTestId('doc-progress')).toBeInTheDocument();
    expect(screen.getByTestId('doc-progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('doc-progress-label')).toBeInTheDocument();
  });
});
