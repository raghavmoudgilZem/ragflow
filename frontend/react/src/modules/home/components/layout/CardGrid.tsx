import { Box } from '@mui/material';
import type React from 'react';

interface CardGridProps {
  children: React.ReactNode;
}

// Responsive single-row grid.
// Shows (N-1) data cards + SeeAll at each N-column breakpoint so SeeAll
// always occupies the last slot and never wraps to a new row.
export const CardGrid = ({ children }: CardGridProps) => (
  <Box
    sx={(theme) => ({
      display: 'grid',
      gap: theme.spacing(2),

      // xs — 1 col: show 1 data + SeeAll (2 rows unavoidable at 1 col)
      gridTemplateColumns: 'repeat(1, 1fr)',
      '& > *:nth-child(n+2):not(:last-child)': { display: 'none' },

      // sm — 2 cols: show 1 data + SeeAll = 2 items in 2 cols
      '@media (min-width: 600px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        // xs and sm share the same hide rule (n+2), no reset needed
      },

      // md — 3 cols: show 2 data + SeeAll = 3 items in 3 cols
      '@media (min-width: 900px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
        '& > *:nth-child(n+2):not(:last-child)': { display: 'block' }, // reset sm
        '& > *:nth-child(n+3):not(:last-child)': { display: 'none' },
      },

      // lg — 4 cols: show 3 data + SeeAll = 4 items in 4 cols
      '@media (min-width: 1200px)': {
        gridTemplateColumns: 'repeat(4, 1fr)',
        '& > *:nth-child(n+3):not(:last-child)': { display: 'block' }, // reset md
        '& > *:nth-child(n+4):not(:last-child)': { display: 'none' },
      },

      // xl — 5 cols: show 4 data + SeeAll = 5 items in 5 cols
      '@media (min-width: 1536px)': {
        gridTemplateColumns: 'repeat(5, 1fr)',
        '& > *:nth-child(n+4):not(:last-child)': { display: 'block' }, // reset lg
        '& > *:nth-child(n+5):not(:last-child)': { display: 'none' },
      },
    })}
  >
    {children}
  </Box>
);
