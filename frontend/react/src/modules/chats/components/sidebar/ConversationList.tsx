import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { ConversationItem } from './ConversationItem';
import { useConversationList } from '@modules/chats/hooks/useConversationList';
import type { ConversationListProps } from '@modules/chats/types/conversation.types';
import { useSidebarStore } from '@modules/chats/store/chatSidebarstore';
import { useEffect, useRef } from 'react';

const skeletons = [1, 2, 3, 4, 5];
const LoadingSkeletons = () => (
  <Box sx={{ px: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    {skeletons.map((id) => (
      <Skeleton key={id} variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
    ))}
  </Box>
);

export const ConversationList = ({ dialogId, onSelect }: ConversationListProps) => {
  const { searchTerm, activeConversationId } = useSidebarStore();
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationList(
    dialogId,
    debouncedSearch || undefined,
  );

  const conversations =
    data?.pages.flatMap(
      (page) => page.conversations
    ) ?? [];

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const threshold = 150;

      const reachedBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
        threshold;

      if (
        reachedBottom &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  if (isLoading) return <LoadingSkeletons />;

  if (isError) return (
    <Box sx={{ px: 2, py: 3, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
      <Alert severity="error" sx={{ width: '100%' }}>
        Failed to load conversations.
      </Alert>
      <Button size="small" variant="outlined" onClick={() => refetch()}>
        Retry
      </Button>
    </Box>
  );

  if (conversations.length === 0 && debouncedSearch) return (
    <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.disabled">
        No results found
      </Typography>
    </Box>
  );

  if (conversations.length === 0) return (
    <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.disabled">
        No conversations yet
      </Typography>
    </Box>
  );

  return (
    <Box
      ref={scrollRef}
      sx={{
        overflowY: 'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        maxHeight: '64vh'
      }}
    >
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onClick={onSelect}
        />
      ))}

      {isFetchingNextPage && (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
        </Box>
      )}
    </Box>
  );
};
