import { describe, it, expect } from 'vitest';
import { IngestionStatus } from '../types/ingestion.types';
import {
  ingestionStatusColor,
  ingestionStatusTone,
  isActiveStatus,
  isTerminalStatus,
} from './ingestionStatus';

describe('isTerminalStatus', () => {
  it.each([IngestionStatus.Cancel, IngestionStatus.Done, IngestionStatus.Fail])(
    'returns true for %s',
    (status) => {
      expect(isTerminalStatus(status)).toBe(true);
    },
  );

  it.each([
    IngestionStatus.Unstart,
    IngestionStatus.Running,
    IngestionStatus.Schedule,
  ])('returns false for %s', (status) => {
    expect(isTerminalStatus(status)).toBe(false);
  });
});

describe('isActiveStatus', () => {
  it.each([
    IngestionStatus.Unstart,
    IngestionStatus.Running,
    IngestionStatus.Schedule,
  ])('returns true for %s so polling keeps running', (status) => {
    expect(isActiveStatus(status)).toBe(true);
  });

  it.each([IngestionStatus.Cancel, IngestionStatus.Done, IngestionStatus.Fail])(
    'returns false for %s so polling stops',
    (status) => {
      expect(isActiveStatus(status)).toBe(false);
    },
  );

  it('is the exact negation of isTerminalStatus', () => {
    Object.values(IngestionStatus).forEach((status) => {
      expect(isActiveStatus(status)).toBe(!isTerminalStatus(status));
    });
  });
});

describe('ingestionStatusTone', () => {
  it('falls back to the neutral tone for a status the worker adds later', () => {
    expect(ingestionStatusTone('9' as IngestionStatus)).toBe('primary');
  });
});

describe('ingestionStatusColor', () => {
  it.each([
    [IngestionStatus.Unstart, 'primary.main'],
    [IngestionStatus.Running, 'info.main'],
    [IngestionStatus.Cancel, 'warning.main'],
    [IngestionStatus.Done, 'success.main'],
    [IngestionStatus.Fail, 'error.main'],
  ])('maps status %s to %s', (status, color) => {
    expect(ingestionStatusColor(status)).toBe(color);
  });

  it('renders Schedule in a muted tone, keeping it distinct from Unstart', () => {
    expect(ingestionStatusColor(IngestionStatus.Schedule)).toBe(
      'text.secondary',
    );
    expect(ingestionStatusColor(IngestionStatus.Schedule)).not.toBe(
      ingestionStatusColor(IngestionStatus.Unstart),
    );
  });
});
