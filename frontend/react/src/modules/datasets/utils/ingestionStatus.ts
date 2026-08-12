import { IngestionStatus } from '../types/ingestion.types';
import type { StatusTone } from '@shared/theme/statusTones';
import { statusToneColor } from '@shared/theme/statusTones';

const TERMINAL_STATUSES: readonly IngestionStatus[] = [
  IngestionStatus.Cancel,
  IngestionStatus.Done,
  IngestionStatus.Fail,
];

const STATUS_TONE: Record<IngestionStatus, StatusTone> = {
  [IngestionStatus.Unstart]: 'primary',
  [IngestionStatus.Schedule]: 'muted',
  [IngestionStatus.Running]: 'info',
  [IngestionStatus.Cancel]: 'warning',
  [IngestionStatus.Done]: 'success',
  [IngestionStatus.Fail]: 'error',
};

export const ingestionStatusTone = (status: IngestionStatus): StatusTone =>
  STATUS_TONE[status] ?? 'primary';

export const ingestionStatusColor = (status: IngestionStatus): string =>
  statusToneColor(ingestionStatusTone(status));

export const isTerminalStatus = (status: IngestionStatus): boolean =>
  TERMINAL_STATUSES.includes(status);

export const isActiveStatus = (status: IngestionStatus): boolean =>
  !isTerminalStatus(status);
