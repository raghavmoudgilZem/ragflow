import { Box, Typography } from '@mui/material';
import type { DocumentDetail } from '../types/chunk.types';

interface DocumentPreviewPanelProps {
  documentDetail: DocumentDetail;
}

function ConstitutionCover() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        aspectRatio: '3 / 4',
        bgcolor: 'var(--cover-bg)',
        color: 'var(--cover-text)',
        borderRadius: 0,
        border: '1px solid var(--chunk-panel-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 4,
        py: 5,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <Typography sx={{ fontSize: '0.85rem', letterSpacing: 2.5, color: 'var(--chunk-text-muted)' }}>
        भारत का संविधान
      </Typography>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '2px solid var(--chunk-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          color: 'var(--cover-text)',
        }}
      >
        ☸
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3, color: 'var(--cover-text)' }}>
        THE CONSTITUTION
        <br />
        OF INDIA
      </Typography>
      <Typography sx={{ fontSize: '0.9rem', color: 'var(--chunk-text-muted)' }}>2024</Typography>
      <Box sx={{ mt: 3, width: '70%', height: 1, bgcolor: 'var(--chunk-panel-border)' }} />
      <Typography sx={{ fontSize: '0.8rem', color: 'var(--chunk-text-muted)', mt: 1 }}>
        As on 1st May, 2024
      </Typography>
    </Box>
  );
}

export function DocumentPreviewPanel({ documentDetail }: DocumentPreviewPanelProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Typography
          sx={{
            color: 'var(--chunk-text-h)',
            fontWeight: 700,
            fontSize: '1.75rem',
            lineHeight: 1.2,
          }}
        >
          {documentDetail.name}
        </Typography>
        <Typography sx={{ color: 'var(--chunk-text-muted)', fontSize: '0.85rem', mt: 1 }}>
          Size : {documentDetail.sizeLabel}
          {'  '}
          Uploaded Time : {documentDetail.uploadedAt}
        </Typography>
      </Box>

      <Box
        className="chunk-scroll"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            pt: 1,
          }}
        >
          <ConstitutionCover />
        </Box>

      </Box>
    </Box>
  );
}
