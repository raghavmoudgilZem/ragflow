import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CircleHelp, Minus, Plus, Trash2, X } from 'lucide-react';
import { useCreateChunk } from '../hooks/useCreateChunk';

interface CreateChunkDialogProps {
  open: boolean;
  documentId: string;
  onClose: () => void;
}

interface TagEntry {
  name: string;
  value: number;
}

const TAG_OPTIONS = ['Tag', 'Section', 'Article', 'Chapter'];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'var(--dialog-field-bg)',
    color: 'var(--dialog-text)',
    borderRadius: 1.5,
    fontSize: '0.875rem',
    '& fieldset': { borderColor: 'var(--dialog-field-border)' },
    '&:hover fieldset': { borderColor: 'var(--dialog-field-border)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--dialog-field-focus)' },
  },
};

function SectionLabel({
  label,
  help,
}: {
  label: string;
  help?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
      <Typography sx={{ color: 'var(--dialog-text-muted)', fontSize: '0.85rem' }}>
        {label}
      </Typography>
      {help && (
        <CircleHelp size={14} color="var(--dialog-text-muted)" strokeWidth={1.75} />
      )}
    </Box>
  );
}

function AddSquareButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: 36,
        height: 36,
        border: '1px solid var(--dialog-field-border)',
        borderRadius: 1.5,
        color: 'var(--dialog-text-muted)',
        bgcolor: 'var(--dialog-field-bg)',
        '&:hover': { bgcolor: 'var(--dialog-field-bg)' },
      }}
    >
      <Plus size={18} />
    </IconButton>
  );
}

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: 24,
        height: 24,
        p: 0,
        flexShrink: 0,
        color: 'var(--danger)',
        '&:hover': { opacity: 0.8 },
      }}
    >
      <Minus size={20} strokeWidth={2} />
    </IconButton>
  );
}

function TagEntryRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: TagEntry;
  onChange: (entry: TagEntry) => void;
  onRemove: () => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Select
        size="small"
        displayEmpty
        value={entry.name}
        renderValue={(selected) => selected || 'Tag'}
        onChange={(e) => onChange({ ...entry, name: e.target.value })}
        sx={{
          flex: 1,
          minWidth: 0,
          ...fieldSx,
          '& .MuiSelect-select': {
            color: entry.name ? 'var(--dialog-text)' : 'var(--dialog-text-muted)',
          },
        }}
      >
        {TAG_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>

      <TextField
        size="small"
        type="number"
        value={entry.value}
        onChange={(e) =>
          onChange({ ...entry, value: Number(e.target.value) || 0 })
        }
        sx={{
          width: 72,
          flexShrink: 0,
          ...fieldSx,
          '& input': { textAlign: 'center', MozAppearance: 'textfield' },
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
        }}
      />

      <RemoveRowButton onClick={onRemove} />
    </Box>
  );
}

export function CreateChunkDialog({
  open,
  documentId,
  onClose,
}: CreateChunkDialogProps) {
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<TagEntry[]>([]);

  const createChunk = useCreateChunk({
    onSuccess: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      setContent('');
      setKeywords([]);
      setEditingKeywordIndex(null);
      setQuestions([]);
      setEditingQuestionIndex(null);
      setTags([]);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!content.trim()) {
      return;
    }

    createChunk.mutate({
      documentId,
      content: content.trim(),
      metadata: {
        keywords: keywords.filter(Boolean),
        tags: tags
          .filter((tag) => tag.name)
          .map((tag) => `${tag.name}:${tag.value}`),
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'var(--dialog-bg)',
            backgroundImage: 'none',
            border: '1px solid var(--dialog-border)',
            borderRadius: 2.5,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 1.5,
          color: 'var(--dialog-text)',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Create Chunk
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'var(--dialog-text-muted)', p: 0.5 }}
          aria-label="Close dialog"
        >
          <X size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <SectionLabel label="Chunk" />
            <TextField
              multiline
              minRows={4}
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--dialog-field-bg)',
                  color: 'var(--dialog-text)',
                  borderRadius: 1.5,
                  alignItems: 'flex-start',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: 'var(--dialog-field-border)' },
                  '&:hover fieldset': { borderColor: 'var(--dialog-field-border)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--dialog-field-focus)' },
                },
              }}
            />
          </Box>

          <Box>
            <SectionLabel label="Keyword" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              {keywords.map((keyword, index) =>
                editingKeywordIndex === index ? (
                  <TextField
                    key={`kw-edit-${index}`}
                    size="small"
                    autoFocus
                    value={keyword}
                    onChange={(e) => {
                      const next = [...keywords];
                      next[index] = e.target.value;
                      setKeywords(next);
                    }}
                    onBlur={() => {
                      setEditingKeywordIndex(null);
                      setKeywords((prev) => prev.filter((k) => k.trim() !== ''));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingKeywordIndex(null);
                        setKeywords((prev) => prev.filter((k) => k.trim() !== ''));
                      }
                    }}
                    sx={{
                      width: 140,
                      ...fieldSx,
                    }}
                  />
                ) : (
                  <Box
                    key={`kw-${index}`}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.6,
                      bgcolor: 'var(--dialog-field-bg)',
                      border: '1px solid var(--dialog-field-border)',
                      borderRadius: 1.5,
                      color: 'var(--dialog-text)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditingKeywordIndex(index)}
                  >
                    <span>{keyword}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setKeywords((prev) => prev.filter((_, i) => i !== index));
                        if (editingKeywordIndex === index) setEditingKeywordIndex(null);
                      }}
                      sx={{ p: 0.25, color: 'var(--dialog-text-muted)', '&:hover': { color: 'var(--dialog-text)' } }}
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </Box>
                )
              )}
              {editingKeywordIndex === null && (
                <AddSquareButton
                  onClick={() => {
                    const newIndex = keywords.length;
                    setKeywords((prev) => [...prev, '']);
                    setEditingKeywordIndex(newIndex);
                  }}
                />
              )}
            </Box>
          </Box>

          <Box>
            <SectionLabel label="Question" help />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              {questions.map((question, index) =>
                editingQuestionIndex === index ? (
                  <TextField
                    key={`q-edit-${index}`}
                    size="small"
                    autoFocus
                    value={question}
                    onChange={(e) => {
                      const next = [...questions];
                      next[index] = e.target.value;
                      setQuestions(next);
                    }}
                    onBlur={() => {
                      setEditingQuestionIndex(null);
                      setQuestions((prev) => prev.filter((q) => q.trim() !== ''));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingQuestionIndex(null);
                        setQuestions((prev) => prev.filter((q) => q.trim() !== ''));
                      }
                    }}
                    sx={{
                      width: 180,
                      ...fieldSx,
                    }}
                  />
                ) : (
                  <Box
                    key={`q-${index}`}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.6,
                      bgcolor: 'var(--dialog-field-bg)',
                      border: '1px solid var(--dialog-field-border)',
                      borderRadius: 1.5,
                      color: 'var(--dialog-text)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditingQuestionIndex(index)}
                  >
                    <span>{question}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuestions((prev) => prev.filter((_, i) => i !== index));
                        if (editingQuestionIndex === index) setEditingQuestionIndex(null);
                      }}
                      sx={{ p: 0.25, color: 'var(--dialog-text-muted)', '&:hover': { color: 'var(--dialog-text)' } }}
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </Box>
                )
              )}
              {editingQuestionIndex === null && (
                <AddSquareButton
                  onClick={() => {
                    const newIndex = questions.length;
                    setQuestions((prev) => [...prev, '']);
                    setEditingQuestionIndex(newIndex);
                  }}
                />
              )}
            </Box>
          </Box>

          <Box>
            <SectionLabel label="Tags" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tags.map((tag, index) => (
                <TagEntryRow
                  key={`tag-${index}`}
                  entry={tag}
                  onChange={(entry) => {
                    const next = [...tags];
                    next[index] = entry;
                    setTags(next);
                  }}
                  onRemove={() =>
                    setTags((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ))}
              <Button
                fullWidth
                onClick={() => setTags((prev) => [...prev, { name: '', value: 0 }])}
                sx={{
                  justifyContent: 'center',
                  textTransform: 'none',
                  color: 'var(--dialog-text-muted)',
                  bgcolor: 'var(--dialog-field-bg)',
                  border: '1px solid var(--dialog-field-border)',
                  borderRadius: 1.5,
                  py: 0.75,
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: 'var(--dialog-field-bg)' },
                }}
              >
                + Add tag
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: 'var(--dialog-text)',
            minWidth: 72,
            border: '1px solid var(--dialog-btn-cancel-border)',
            bgcolor: 'var(--dialog-btn-cancel-bg)',
            borderRadius: 1.5,
            px: 2,
            py: 0.6,
            fontSize: '0.85rem',
            '&:hover': {
              bgcolor: 'var(--dialog-field-bg)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!content.trim() || createChunk.isPending}
          sx={{
            textTransform: 'none',
            bgcolor: 'var(--dialog-btn-confirm-bg)',
            color: 'var(--dialog-btn-confirm-text)',
            borderRadius: 1.5,
            px: 2.5,
            py: 0.6,
            fontSize: '0.85rem',
            fontWeight: 500,
            '&:hover': { bgcolor: 'var(--dialog-btn-confirm-bg)', opacity: 0.9 },
            '&.Mui-disabled': {
              bgcolor: 'var(--dialog-field-border)',
              color: 'var(--dialog-text-muted)',
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
