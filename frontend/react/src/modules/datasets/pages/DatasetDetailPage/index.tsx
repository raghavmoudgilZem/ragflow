import {
  Alert,
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { DocumentParsingStatus } from '../../components/DocumentParsingStatus';
import { useDocumentProgress } from '../../hooks/useDocumentProgress';
import type { DocumentProgressListParams } from '../../types/ingestion.types';

const DEFAULT_PARAMS: DocumentProgressListParams = { page: 1, pageSize: 10 };

const SKELETON_ROW_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

const rootStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  p: 2,
};

const nameCellStyles: SxProps<Theme> = {
  maxWidth: '20rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const DatasetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isPending, isError } = useDocumentProgress(id, DEFAULT_PARAMS);

  const documents = data?.docs ?? [];

  if (isError) {
    return (
      <Box sx={rootStyles} data-testid="dataset-detail-page">
        <Alert severity="error" data-testid="dataset-detail-error">
          {t('knowledgeDetails.documentsError')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={rootStyles} data-testid="dataset-detail-page">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('knowledgeDetails.name')}</TableCell>
              <TableCell>{t('knowledgeDetails.chunkNumber')}</TableCell>
              <TableCell>{t('knowledgeDetails.parsingStatus')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isPending &&
              SKELETON_ROW_KEYS.map((rowKey) => (
                <TableRow key={rowKey} data-testid="dataset-detail-skeleton-row">
                  <TableCell colSpan={3}>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))}

            {!isPending &&
              documents.map((record) => (
                <TableRow key={record.id} data-testid="dataset-detail-row">
                  <TableCell sx={nameCellStyles} title={record.name}>
                    {record.name}
                  </TableCell>
                  <TableCell>{record.chunk_num}</TableCell>
                  <TableCell>
                    <DocumentParsingStatus record={record} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!isPending && documents.length === 0 && (
        <Typography variant="body2" data-testid="dataset-detail-empty">
          {t('knowledgeDetails.noDocuments')}
        </Typography>
      )}
    </Box>
  );
};

export default DatasetDetailPage;
