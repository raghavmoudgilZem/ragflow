export type StatusTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

export type StatusTonePaletteColor = Exclude<StatusTone, 'muted'>;

const MUTED_TEXT_COLOR = 'text.secondary';

const MUTED_PALETTE_FALLBACK: StatusTonePaletteColor = 'info';

export const statusToneColor = (tone: StatusTone): string =>
  tone === 'muted' ? MUTED_TEXT_COLOR : `${tone}.main`;

export const statusTonePaletteColor = (
  tone: StatusTone,
): StatusTonePaletteColor =>
  tone === 'muted' ? MUTED_PALETTE_FALLBACK : tone;
