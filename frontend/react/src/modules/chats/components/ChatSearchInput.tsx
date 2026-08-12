import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Search } from 'lucide-react';
import { useChatUiStore } from '../store/chatUiStore';

export const ChatSearchInput = () => {
  const { searchTerm, setSearchTerm } = useChatUiStore();

  return (
    <TextField
      size="small"
      placeholder="Search chats"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ 
        width: 220,
        // Target the root wrapper of the outlined input
        '& .MuiOutlinedInput-root': {
          // Target the fieldset (border) when the input is focused
          '&.Mui-focused fieldset': {
            borderColor: '#00beb4',
          },
        },
      }}
    />
  );
};