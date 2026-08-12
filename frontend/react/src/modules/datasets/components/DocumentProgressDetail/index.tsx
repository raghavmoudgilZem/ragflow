import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { DocumentProgress } from '../../types/ingestion.types';
import { toProgressMessageSegments } from '../../utils/progressMessage';
import { StatusDot } from '../StatusDot';

const rootStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  p: 1.5,
  maxWidth: '28rem',
  minWidth: '16rem',
};

const headerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  pb: 1,
};

const bodyStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  maxHeight: '50vh',
  overflow: 'auto',
};

const inlineRowStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
};

const messageStyles: SxProps<Theme> = {
  whiteSpace: 'pre-line',
  overflowWrap: 'anywhere',
};

const errorSegmentStyles: SxProps<Theme> = {
  color: 'error.main',
};

interface DocumentProgressDetailProps {
  record: DocumentProgress;
}

const DocumentProgressDetailComponent = ({
  record,
}: DocumentProgressDetailProps) => {
  const { t } = useTranslation();
  const segments = toProgressMessageSegments(record.progress_msg);

  return (
    <Box sx={rootStyles} data-testid="document-progress-detail">
      <Box sx={headerStyles}>
        <StatusDot status={record.run} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {t(`knowledgeDetails.runningStatus${record.run}`)}
        </Typography>
      </Box>

      <Box sx={bodyStyles}>
        <Box sx={inlineRowStyles}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {`${t('knowledgeDetails.processDuration')}:`}
          </Typography>
          <Typography variant="caption" data-testid="document-progress-duration">
            {`${record.process_duration.toFixed(2)} s`}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {`${t('knowledgeDetails.progressMsg')}:`}
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={messageStyles}
            data-testid="document-progress-message"
          >
            {segments.map((segment, index) => (
              <Box
                key={`${index}-${segment.text}`}
                component="span"
                sx={segment.isError ? errorSegmentStyles : undefined}
                data-testid={
                  segment.isError ? 'document-progress-error-segment' : undefined
                }
              >
                {segment.text}
              </Box>
            ))}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export const DocumentProgressDetail = memo(DocumentProgressDetailComponent);
