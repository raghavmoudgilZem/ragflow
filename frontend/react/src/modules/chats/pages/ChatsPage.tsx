import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useNavigate } from 'react-router-dom';

import { useChatUiStore } from '../store/chatUiStore';
import { useChatList } from '../hooks/useChatList';
import { useDeleteChat } from '../hooks/useDeleteChat';
import { useRenameChat } from '../hooks/useRenameChat';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

import { ChatsPageHeader } from '../components/ChatsPageHeader';
import { ChatEmptyState } from '../components/ChatEmptyState';
import { ChatCardGrid } from '../components/ChatCardGrid';
import { ChatPagination } from '../components/ChatPagination';
import { CreateChatModal } from '../components/modals/CreateChatModal';

// 6 skeleton cards shown while the list is loading
const skeletons = [1, 2, 3, 4, 5, 6];

const LoadingSkeletons = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
      gap: 2,
    }}
  >
    {skeletons.map((id) => (
      <Skeleton key={id} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
    ))}
  </Box>
);

const ChatsPage = () => {
  const navigate = useNavigate();

  const {
    page, pageSize, searchTerm, isModalOpen, renameTarget, closeRenameModal,
    openModal, closeModal, setPage, setPageSize,
  } = useChatUiStore();

  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const { data, isLoading, isError } = useChatList({
    page,
    page_size: pageSize,
    keywords: debouncedSearch || undefined,
  });

  const renameChat = useRenameChat();
  const deleteChat = useDeleteChat();

  const chats = data?.dialogs ?? [];

  const handleChatClick = (id: string) => navigate(`/chats/${id}`);

  const handleRename = (
    newName: string,
    callbacks: { onSuccess: () => void; onError: () => void },
  ) => {
    if (!renameTarget) return;
    renameChat.mutate(
      { dialog_id: renameTarget.id, name: newName },
      callbacks,
    );
  };

  const handleDelete = (id: string) =>
    deleteChat.mutate(id);

  return (
    <Box sx={{ minHeight: '100vh', maxWidth: 'xxl', mx: 'auto', px: 3, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <ChatsPageHeader chatCount={chats.length} onCreateClick={openModal} />
      <Box sx={{ flex: 1 }}>
        {isLoading && <LoadingSkeletons />}

        {isError && !isLoading && (
          <Alert severity="error">Failed to load chat apps. Please try again.</Alert>
        )}

        {!isLoading && !isError && chats.length === 0 && (
          <ChatEmptyState onCreateClick={openModal} />
        )}

        {!isLoading && !isError && chats.length > 0 && (
            <ChatCardGrid
              chats={chats}
              onChatClick={handleChatClick}
              onDelete={handleDelete}
            />
        )}
      </Box>
      {!isLoading && !isError && chats.length > 0 && (
        <Box sx={{ mt: 'auto', pt: 3 }}>
          <ChatPagination
            total={data?.meta?.total ?? 0}
            totalPages={data?.meta?.total_pages ?? 1}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </Box>
      )}
      <CreateChatModal mode="create" open={isModalOpen} onClose={closeModal} />
      <CreateChatModal
        mode="rename"
        open={Boolean(renameTarget)}
        onClose={closeRenameModal}
        initialName={renameTarget?.name ?? ''}
        onRename={handleRename}
      />
    </Box>
  );
};

export default ChatsPage;
