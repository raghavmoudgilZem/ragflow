import { useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { ListFilter, Plus, Search, CheckCircle2, CircleMinus, Trash2, type LucideIcon } from 'lucide-react';
import type { ChunkEnabledFilter, ChunkViewMode } from '../types/chunk.types';

// Colors use CSS custom properties for theme consistency

interface ChunkToolbarProps {
  viewMode: ChunkViewMode;
  onViewModeChange: (mode: ChunkViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  enabledFilter: ChunkEnabledFilter;
  onEnabledFilterChange: (filter: ChunkEnabledFilter) => void;
  selectAll: boolean;
  someSelected?: boolean;
  onSelectAllChange: (checked: boolean) => void;
  selectedCount: number;
  onEnableSelected?: () => void;
  onDisableSelected?: () => void;
  onDeleteSelected?: () => void;
  enableSelectedDisabled?: boolean;
  disableSelectedDisabled?: boolean;
  deleteSelectedDisabled?: boolean;
  onAddClick?: () => void;
}

const FILTER_OPTIONS: { value: ChunkEnabledFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

const VIEW_MODE_OPTIONS: { value: ChunkViewMode; label: string }[] = [
  { value: 'full', label: 'Full text' },
  { value: 'ellipsis', label: 'Ellipse' },
];

interface ViewModeToggleProps {
  viewMode: ChunkViewMode;
  onViewModeChange: (mode: ChunkViewMode) => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const activeIndex = VIEW_MODE_OPTIONS.findIndex((option) => option.value === viewMode);

  return (
    <Box
      className="chunk-view-toggle"
      data-active={activeIndex}
      role="group"
      aria-label="View mode"
    >
      <Box className="chunk-view-toggle__thumb" aria-hidden />

      {VIEW_MODE_OPTIONS.map((option) => {
        const active = viewMode === option.value;

        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            className={`chunk-view-toggle__option${active ? ' chunk-view-toggle__option--active' : ''}`}
            onClick={() => onViewModeChange(option.value)}
            aria-pressed={active}
          >
            {option.label}
          </Box>
        );
      })}
    </Box>
  );
}

function BulkActionButton({
  icon: Icon,
  label,
  iconColor,
  labelColor,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  iconColor: string;
  labelColor: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        px: 1.25,
        py: 0.65,
        m: 0,
        color: labelColor,
        fontSize: '0.8rem',
        fontFamily: 'inherit',
        lineHeight: 1.2,
        borderRadius: 1.5,
        '&:hover': disabled ? {} : { bgcolor: 'var(--chunk-control-active)' },
        '&:focus-visible': { outline: 'none' },
        '& > svg': { pointerEvents: 'none', flexShrink: 0 },
        '& > *': { pointerEvents: 'none' },
      }}
    >
      <Icon size={16} color={iconColor} strokeWidth={1.75} />
      {label}
    </Box>
  );
}

export function ChunkToolbar({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  enabledFilter,
  onEnabledFilterChange,
  selectAll,
  someSelected,
  onSelectAllChange,
  selectedCount,
  onEnableSelected,
  onDisableSelected,
  onDeleteSelected,
  enableSelectedDisabled,
  disableSelectedDisabled,
  deleteSelectedDisabled,
  onAddClick,
}: ChunkToolbarProps) {
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchor);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TextField
            size="medium"
            placeholder="Search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="var(--chunk-text-muted)" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: 260,
              '& .MuiOutlinedInput-root': {
                color: 'var(--chunk-text-h)',
                fontSize: '0.9rem',
                borderRadius: '8px',
                bgcolor: 'transparent',
                '& fieldset': { borderColor: 'var(--chunk-panel-border)' },
                '&:hover fieldset': { borderColor: 'var(--chunk-panel-border)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--chunk-text-h)' },
                '& input::placeholder': { color: 'var(--chunk-text-muted)', opacity: 1 },
              },
            }}
          />
          <IconButton
  size="small"
  onClick={(e) => setFilterAnchor(e.currentTarget)}
  sx={{
    color: filterOpen ? 'var(--chunk-text-h)' : 'var(--chunk-text-muted)',
    bgcolor: filterOpen ? 'var(--chunk-segment-selected)' : 'transparent',
    border: '1px solid var(--chunk-panel-border)',
    borderRadius: '8px',
    width: 36,
    height: 36,
  }}
>
            <ListFilter size={20} />
          </IconButton>
          <IconButton
  size="small"
  onClick={() => onAddClick?.()}
  sx={{
    color: 'var(--chunk-text-h)',
    bgcolor: 'transparent',
    border: '1px solid var(--chunk-panel-border)',
    borderRadius: '8px',
    width: 36,
    height: 36,
    '&:hover': { bgcolor: 'var(--chunk-control-active)' },
  }}
>
            <Plus size={20} />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={filterAnchor}
        open={filterOpen}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 168,
              bgcolor: 'var(--chunk-panel-bg)',
              border: '1px solid var(--chunk-panel-border)',
              borderRadius: 2,
              boxShadow: 'var(--chunk-menu-shadow)',
              backgroundImage: 'none',
              py: 1,
            },
          },
          list: {
            sx: { py: 0 },
          },
        }}
      >
        <RadioGroup
          value={enabledFilter}
          onChange={(_, value) => {
            onEnabledFilterChange(value as ChunkEnabledFilter);
            setFilterAnchor(null);
          }}
        >
          {FILTER_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  size="small"
                  sx={{
                    color: 'var(--chunk-text-muted)',
                    '&.Mui-checked': { color: 'var(--chunk-text-h)' },
                    p: 0.75,
                  }}
                />
              }
              label={
                <Typography sx={{ color: 'var(--chunk-text-h)', fontSize: '0.875rem' }}>
                  {option.label}
                </Typography>
              }
              sx={{
                mx: 0,
                my: 0,
                px: 1.5,
                py: 0.25,
                width: '100%',
                mr: 0,
                '&:hover': { bgcolor: 'var(--chunk-control-active)' },
              }}
            />
          ))}
        </RadioGroup>
      </Menu>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={selectAll}
              indeterminate={!selectAll && Boolean(someSelected)}
              onChange={(e) => onSelectAllChange(e.target.checked)}
              sx={{
                color: 'var(--chunk-text-muted)',
                '&.Mui-checked': { color: 'var(--chunk-text-h)' },
                '&.MuiCheckbox-indeterminate': { color: 'var(--chunk-text-h)' },
              }}
            />
          }
          label="Select all"
          sx={{
            m: 0,
            color: 'var(--chunk-text)',
            '& .MuiFormControlLabel-label': { fontSize: '0.85rem' },
          }}
        />

        {selectedCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <BulkActionButton
              icon={CheckCircle2}
              label="Enable"
              iconColor="var(--chunk-text)"
              labelColor="var(--chunk-text)"
              onClick={onEnableSelected}
              disabled={enableSelectedDisabled}
            />
            <BulkActionButton
              icon={CircleMinus}
              label="Disable"
              iconColor="var(--chunk-text)"
              labelColor="var(--chunk-text)"
              onClick={onDisableSelected}
              disabled={disableSelectedDisabled}
            />
            <BulkActionButton
              icon={Trash2}
              label="Delete"
              iconColor="var(--danger)"
              labelColor="var(--danger)"
              onClick={onDeleteSelected}
              disabled={deleteSelectedDisabled}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
