import { useSidebarStore } from '@modules/chats/store/chatSidebarstore';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Search } from 'lucide-react';

export const SidebarSearch = () => {
  const { searchTerm, setSearchTerm } = useSidebarStore();

  return (
    <TextField
      size="small"
      fullWidth
      placeholder="Search conversations"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={14} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ px: 1.5 }}
    />
  );
};
