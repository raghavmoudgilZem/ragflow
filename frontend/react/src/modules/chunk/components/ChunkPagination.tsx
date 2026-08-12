import { Box, MenuItem, Pagination, Select, Typography } from '@mui/material';

interface ChunkPaginationProps {
  totalItems: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ChunkPagination({
  totalItems,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ChunkPaginationProps) {
  // Ensure totalPages is at least 1 to keep pagination visible
  const safeTotalPages = Math.max(totalPages, 1);
  const safeTotalItems = totalItems;

  return (
    <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 2,
    pt: 2, /* Increased padding slightly to match screenshot */
    borderTop: '1px solid var(--chunk-panel-border)',
    flexShrink: 0,
  }}
>

      <Typography sx={{ color: 'var(--chunk-text)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        Total {safeTotalItems}
      </Typography>

      <Box className="chunk-pagination" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={safeTotalPages}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          size="small"
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>

      <Select
  size="small"
  value={pageSize}
  onChange={(e) => onPageSizeChange(Number(e.target.value))}
  sx={{
    color: 'var(--chunk-text-h)',
    fontSize: '0.8rem',
    minWidth: 90,
    bgcolor: 'var(--chunk-panel-bg)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--chunk-panel-border)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--chunk-panel-border)' },
  }}
  slotProps={{
    paper: {
      sx: {
        bgcolor: 'var(--chunk-panel-bg)',
        border: '1px solid var(--chunk-panel-border)',
        backgroundImage: 'none',
      },
    },
  }}
>
      
        {PAGE_SIZE_OPTIONS.map((size) => (
          <MenuItem
            key={size}
            value={size}
            sx={{
              color: 'var(--chunk-text-h)',
              '&:hover': {
                bgcolor: 'var(--chunk-card-bg)',
              },
            }}
          >
            {size} /Page
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
