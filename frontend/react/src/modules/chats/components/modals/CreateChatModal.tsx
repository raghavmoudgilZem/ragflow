import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import { useCreateChat } from '../../hooks/useCreateChat';
import type { CreateChatModalProps } from '@modules/chats/types/chat.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof schema>;

export const CreateChatModal = (props: CreateChatModalProps) => {
  const theme = useTheme();
  const { open, initialName, onRename, onClose } = props;
  const [errorOpen, setErrorOpen] = useState(false);
  const isRenameMode = props.mode === 'rename';

  const { control, handleSubmit, reset, formState: { isValid, isDirty } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: initialName ?? '' },
      mode: 'onChange',
    });

  const createChat = useCreateChat();

  useEffect(() => {
    if (open) {
      reset({ name: initialName ?? '' });
    }
  }, [open, initialName, reset]);

  const onSubmit = (values: FormValues) => {
    if (onRename && isRenameMode) {
      onRename(values.name, {
        onSuccess: () => onClose(),
        onError: () => setErrorOpen(true),
      });
      return;
    }
    createChat.mutate(
      {
        name: values.name,
        language: "English",
        llm_id: "llama3.2@Ollama",// Temporary static value. In a future enhancement, this data will be fetched dynamically from the model provider context. Since that functionality has not been implemented yet, a hardcoded value is being used for now and will be replaced once the feature is available. 
        similarity_threshold: 0.2,
        vector_similarity_weight: 0.3,
        top_n: 8,
        prompt_config: {
          system_prompt: "You are a helpful customer support assistant."
        }
      },
      {
        onSuccess: () => onClose(),
        onError: () => setErrorOpen(true),
      },
    );
  };

  const isPending = createChat.isPending;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontSize: '1rem',
          fontWeight: 600,
          p: 2
        }}>
          {isRenameMode ? 'Rename chat' : 'Create chat'}
          <Tooltip title="Close">
            <IconButton size="small" aria-label="close dialog" onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
              <X size={18} />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
              Name
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  placeholder="Please input name"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  autoFocus
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            variant="contained"
            disabled={!isValid || !isDirty || isPending}
            onClick={handleSubmit(onSubmit)}
            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              backgroundColor: '#fff',
              color: '#000',
              textTransform: 'none',
              fontWeight: 500,
              padding: '6px 16px',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: theme.palette.text.secondary,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorOpen(false)}>
          {isRenameMode
            ? 'Failed to rename chat. Please try again.'
            : 'Failed to create chat. Please try again.'}
        </Alert>
      </Snackbar>
    </>
  );
};