import { IngestionStatus } from '../types/ingestion.types';
import type { DocumentProgress } from '../types/ingestion.types';

export const POLL_INTERVAL_BASE = 5000;

export const POLL_INTERVAL_SUSTAINED = 15000;

export const POLL_INTERVAL_LONG = 30000;

export const POLL_BACKOFF_SUSTAINED_AFTER = 120000;

export const POLL_BACKOFF_LONG_AFTER = 600000;

export const hasRunningDocument = (
  documents: readonly DocumentProgress[],
): boolean =>
  documents.some((document) => document.run === IngestionStatus.Running);

export const pollIntervalForElapsed = (elapsedMs: number): number => {
  if (elapsedMs >= POLL_BACKOFF_LONG_AFTER) {
    return POLL_INTERVAL_LONG;
  }

  if (elapsedMs >= POLL_BACKOFF_SUSTAINED_AFTER) {
    return POLL_INTERVAL_SUSTAINED;
  }

  return POLL_INTERVAL_BASE;
};
