import { memo, useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { ButtonBase, Popover } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { JobProgress } from '@shared/components/JobProgress';
import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgress } from '../../types/ingestion.types';
import { DocumentProgressDetail } from '../DocumentProgressDetail';
import { StatusDot } from '../StatusDot';

const triggerStyles: SxProps<Theme> = {
  borderRadius: '0.25rem',
  px: 0.5,
  py: 0.5,
  justifyContent: 'flex-start',
};

interface DocumentParsingStatusProps {
  record: DocumentProgress;
}

const DocumentParsingStatusComponent = ({
  record,
}: DocumentParsingStatusProps) => {
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorElement(null);
  }, []);

  const isParsing = record.run === IngestionStatus.Running;

  return (
    <>
      <ButtonBase
        onClick={handleOpen}
        sx={triggerStyles}
        aria-label={t(`knowledgeDetails.runningStatus${record.run}`)}
        data-testid={`document-parsing-status-${record.id}`}
      >
        {isParsing ? (
          <JobProgress
            status={record.run}
            progress={record.progress}
            showLabel={false}
          />
        ) : (
          <StatusDot status={record.run} />
        )}
      </ButtonBase>

      <Popover
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <DocumentProgressDetail record={record} />
      </Popover>
    </>
  );
};

export const DocumentParsingStatus = memo(DocumentParsingStatusComponent);
