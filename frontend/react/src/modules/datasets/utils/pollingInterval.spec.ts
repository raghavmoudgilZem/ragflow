import { describe, it, expect } from 'vitest';
import { IngestionStatus } from '../types/ingestion.types';
import type { DocumentProgress } from '../types/ingestion.types';
import {
  POLL_BACKOFF_LONG_AFTER,
  POLL_BACKOFF_SUSTAINED_AFTER,
  POLL_INTERVAL_BASE,
  POLL_INTERVAL_LONG,
  POLL_INTERVAL_SUSTAINED,
  hasRunningDocument,
  pollIntervalForElapsed,
} from './pollingInterval';

const documentWith = (run: IngestionStatus): DocumentProgress => ({
  id: `doc-${run}`,
  name: 'invoice.pdf',
  run,
  progress: 0.4,
  progress_msg: 'Parsing',
  chunk_num: 0,
  token_num: 0,
  process_duration: 1,
});

describe('hasRunningDocument', () => {
  it('reports a run while any document is parsing', () => {
    expect(
      hasRunningDocument([
        documentWith(IngestionStatus.Done),
        documentWith(IngestionStatus.Running),
      ]),
    ).toBe(true);
  });

  it('does not treat unstarted or scheduled documents as a run', () => {
    expect(
      hasRunningDocument([
        documentWith(IngestionStatus.Unstart),
        documentWith(IngestionStatus.Schedule),
      ]),
    ).toBe(false);
  });

  it('does not treat terminal documents as a run', () => {
    expect(
      hasRunningDocument([
        documentWith(IngestionStatus.Done),
        documentWith(IngestionStatus.Fail),
        documentWith(IngestionStatus.Cancel),
      ]),
    ).toBe(false);
  });

  it('reports no run for an empty list', () => {
    expect(hasRunningDocument([])).toBe(false);
  });
});

describe('pollIntervalForElapsed', () => {
  it('holds the base interval for a fresh run', () => {
    expect(pollIntervalForElapsed(0)).toBe(POLL_INTERVAL_BASE);
    expect(pollIntervalForElapsed(POLL_BACKOFF_SUSTAINED_AFTER - 1)).toBe(
      POLL_INTERVAL_BASE,
    );
  });

  it('widens once the run is sustained', () => {
    expect(pollIntervalForElapsed(POLL_BACKOFF_SUSTAINED_AFTER)).toBe(
      POLL_INTERVAL_SUSTAINED,
    );
    expect(pollIntervalForElapsed(POLL_BACKOFF_LONG_AFTER - 1)).toBe(
      POLL_INTERVAL_SUSTAINED,
    );
  });

  it('widens again once the run is long', () => {
    expect(pollIntervalForElapsed(POLL_BACKOFF_LONG_AFTER)).toBe(
      POLL_INTERVAL_LONG,
    );
    expect(pollIntervalForElapsed(POLL_BACKOFF_LONG_AFTER * 10)).toBe(
      POLL_INTERVAL_LONG,
    );
  });
});
