import { memo } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

import { IngestionStatus } from '@modules/datasets/types/ingestion.types';
import {
  ingestionStatusTone,
  isActiveStatus,
} from '@modules/datasets/utils/ingestionStatus';
import {
  statusToneColor,
  statusTonePaletteColor,
} from '@shared/theme/statusTones';

const STATUS_LABEL: Record<IngestionStatus, string> = {
  [IngestionStatus.Unstart]: 'PENDING',
  [IngestionStatus.Schedule]: 'SCHEDULE',
  [IngestionStatus.Running]: 'PARSING',
  [IngestionStatus.Cancel]: 'CANCELED',
  [IngestionStatus.Done]: 'SUCCESS',
  [IngestionStatus.Fail]: 'FAIL',
};

const rootStyles: SxProps<Theme> = {
  display: 'inline-flex',
  flexDirection: 'column',
  gap: 0.5,
  minWidth: '10rem',
};

const barRowStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const barStyles: SxProps<Theme> = {
  flex: 1,
  minWidth: '5rem',
  height: '0.25rem',
  borderRadius: '9999px',
};

const labelRowStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
};

const dotStyles = (color: string): SxProps<Theme> => ({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  bgcolor: color,
  flexShrink: 0,
});

const toPercent = (status: IngestionStatus, progress: number): number => {
  if (status === IngestionStatus.Done) {
    return 100;
  }
  if (!Number.isFinite(progress) || progress <= 0) {
    return 0;
  }
  return Math.min(100, Number((progress * 100).toFixed(2)));
};

export interface JobProgressProps {
  status: IngestionStatus;
  progress: number;
  errorMessage?: string;
  label?: string;
  showLabel?: boolean;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const JobProgressComponent = ({
  status,
  progress,
  errorMessage,
  label,
  showLabel = true,
  sx,
  'data-testid': dataTestId = 'job-progress',
}: JobProgressProps) => {
  const tone = ingestionStatusTone(status);
  const statusColor = statusToneColor(tone);
  const resolvedLabel =
    label ?? STATUS_LABEL[status] ?? STATUS_LABEL[IngestionStatus.Unstart];
  const percent = toPercent(status, progress);
  const active = isActiveStatus(status);
  const hasError = status === IngestionStatus.Fail;

  return (
    <Box
      sx={{ ...rootStyles, ...sx }}
      data-testid={dataTestId}
    >
      <Box sx={barRowStyles}>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={statusTonePaletteColor(tone)}
          aria-label={`${resolvedLabel} ${percent}%`}
          data-testid={`${dataTestId}-bar`}
          sx={barStyles}
        />
        {active && (
          <Typography
            variant="caption"
            data-testid={`${dataTestId}-percent`}
          >
            {percent}%
          </Typography>
        )}
      </Box>

      {showLabel && (
        <Box sx={labelRowStyles}>
          <Box
            component="span"
            sx={dotStyles(statusColor)}
            data-testid={`${dataTestId}-dot`}
          />
          <Typography
            variant="caption"
            sx={{ color: statusColor, fontWeight: 600 }}
            data-testid={`${dataTestId}-label`}
          >
            {resolvedLabel}
          </Typography>
        </Box>
      )}

      {hasError && errorMessage && (
        <Typography
          variant="caption"
          color="error"
          data-testid={`${dataTestId}-error`}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export const JobProgress = memo(JobProgressComponent);
