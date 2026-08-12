import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import AISummarySkeleton from '@shared/components/skeleton/AISummarySkeleton';
import ReferenceCardSkeleton from '@shared/components/skeleton/ReferenceCardSkeleton';
import { skeletonStyles } from './SearchExecutionChat.styles';

const SearchSkeletonView: React.FC = () => {
  const theme = useTheme();
  return (
    <Box sx={skeletonStyles.container}>
      {/* AI Summary Area */}
      <Box sx={skeletonStyles.summaryWrapper}>
        <AISummarySkeleton />
      </Box>

      {/* References Area */}
      <Box sx={skeletonStyles.referencesWrapper}>
        <Skeleton
          variant="text"
          width="12.5rem"
          height={24}
          sx={skeletonStyles.referenceLabelSkeleton}
        />
        <Box sx={skeletonStyles.referenceCardsContainer(theme)}>
          {[1, 2, 3, 4].map((i) => (
            <ReferenceCardSkeleton key={i} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};19187533

export default SearchSkeletonView;