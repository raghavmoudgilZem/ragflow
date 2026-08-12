import { memo } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

import type { IngestionStatus } from '../../types/ingestion.types';
import { ingestionStatusColor } from '../../utils/ingestionStatus';

const dotStyles = (status: IngestionStatus): SxProps<Theme> => ({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  bgcolor: ingestionStatusColor(status),
  flexShrink: 0,
  display: 'inline-block',
});

interface StatusDotProps {
  status: IngestionStatus;
  'data-testid'?: string;
}

const StatusDotComponent = ({
  status,
  'data-testid': dataTestId = 'status-dot',
}: StatusDotProps) => (
  <Box
    component="span"
    sx={dotStyles(status)}
    data-testid={dataTestId}
    aria-hidden="true"
  />
);

export const StatusDot = memo(StatusDotComponent);
