import { Box, Checkbox, Switch } from '@mui/material';
import type { Chunk, ChunkViewMode } from '../types/chunk.types';

const TRUNCATED_CONTENT_LENGTH = 180;
const DEFAULT_CONTENT_TYPE_LABEL = 'Text';

interface ChunkCardProps {
  chunk: Chunk;
  selected: boolean;
  viewMode: ChunkViewMode;
  documentPreviewTitle?: string;
  onSelectChange: (checked: boolean) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export function ChunkCard({
  chunk,
  selected,
  viewMode,
  documentPreviewTitle,
  onSelectChange,
  onEnabledChange,
}: ChunkCardProps) {
  const content =
    viewMode === 'ellipsis' && chunk.content.length > TRUNCATED_CONTENT_LENGTH
      ? `${chunk.content.slice(0, TRUNCATED_CONTENT_LENGTH)}…`
      : chunk.content;

  const contentTypeLabel = chunk.metadata.contentType || DEFAULT_CONTENT_TYPE_LABEL;
  const isEnabled = chunk.enabled ?? true;

  return (
    <Box
      data-selected={selected}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5,
        alignItems: 'flex-start',
        padding: 1.5,
        paddingTop: 2.5,
        marginBottom: 1.5,
        borderRadius: 1.5,
        bgcolor: 'var(--chunk-card-bg)',
        border: '1px solid var(--chunk-panel-border)',
        ...(selected && {
          borderColor: 'var(--chunk-text-muted)',
        }),
      }}
    >
      {/* TEXT TAG - Absolute top right corner */}
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          px: 1.5,
          py: 0.25,
          borderBottomLeftRadius: '8px',
          borderTopRightRadius: '6px',
          borderLeft: '1px solid var(--chunk-panel-border)',
          borderBottom: '1px solid var(--chunk-panel-border)',
          bgcolor: 'var(--chunk-control-bg)',
          color: 'var(--chunk-text-muted)',
          fontSize: '0.72rem',
          lineHeight: 1.4,
          zIndex: 1,
        }}
      >
        {contentTypeLabel}
      </Box>

      {/* 1. CHECKBOX */}
      <Checkbox
        size="small"
        checked={selected}
        onChange={(e) => onSelectChange(e.target.checked)}
        sx={{
          color: 'var(--chunk-text-muted)',
          mt: 0.25,
          '&.Mui-checked': { color: 'var(--chunk-text-h)' },
          flexShrink: 0,
        }}
      />

      {/* 2. THUMBNAIL */}
      <Box sx={{
        width: '50px',
        height: '65px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        border: '1px solid var(--chunk-panel-border)',
        borderRadius: 1,
        bgcolor: 'var(--preview-paper-bg)',
        color: 'var(--preview-paper-text)',
        fontFamily: 'Georgia, "Times New Roman", serif',
        textAlign: 'center',
        fontSize: '0.4rem',
        lineHeight: 1.2,
        overflow: 'hidden',
      }}>
        <span style={{ fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {documentPreviewTitle ?? 'THE CONSTITUTION OF INDIA'}
        </span>
        <span style={{ color: 'var(--preview-paper-muted)', marginTop: '4px' }}>
          Page {chunk.metadata.page ?? 1}
        </span>
      </Box>

      {/* 3. RIGHT COLUMN */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, pr: 4 }}>
        {/* MAIN TEXT */}
        <p style={{
          margin: 0,
          color: 'var(--chunk-text)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          flex: 1,
        }}>
          {content}
        </p>

        {/* SWITCH */}
        <Switch
          className="chunk-switch"
          size="small"
          checked={isEnabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          sx={{
            flexShrink: 0,
            mt: 0.25,
            '& .MuiSwitch-switchBase': {
              color: 'var(--chunk-switch-thumb-off)', // OFF thumb
              '&.Mui-checked': {
                color: 'var(--chunk-switch-thumb-on)', // ON thumb
              },
              '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--chunk-switch-track-active)', // ON track
                opacity: 0.55,
              },
            },
            '& .MuiSwitch-track': {
              backgroundColor: 'var(--chunk-switch-thumb-off)', // OFF track
              opacity: 0.5,
            },
          }}
        />
      </Box>
    </Box>
  );
}