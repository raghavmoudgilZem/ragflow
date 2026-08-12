import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MuiPagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { ChatPaginationProps } from '../types/chat.types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const ChatPagination = ({
  total,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ChatPaginationProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 2 }}>
    <Typography variant="body2" color="text.secondary">
      Total: {total}
    </Typography>

    <MuiPagination
      count={totalPages}
      page={page}
      onChange={(_, value) => onPageChange(value)}
      shape="rounded"
      size="small"
    />

    <Select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      size="small"
      sx={{ minWidth: 80 }}
    >
      {PAGE_SIZE_OPTIONS.map((size) => (
        <MenuItem key={size} value={size}>
          {size} / page
        </MenuItem>
      ))}
    </Select>
  </Box>
);
