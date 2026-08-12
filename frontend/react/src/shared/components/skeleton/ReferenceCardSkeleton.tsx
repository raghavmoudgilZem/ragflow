import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';
import { styles } from './skeleton.style';

const ReferenceCardSkeleton: React.FC = () => {
  return (
    <Paper
      variant="outlined"
      sx={styles.paper}
    >
      {/* Title Skeleton */}
      <Skeleton
        variant="text"
        width="40%"
        height={20}
        sx={styles.box}
      />

      {/* Content Skeletons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton
          variant="text"
          width="100%"
          height={16}
          sx={styles.box}
        />
        <Skeleton
          variant="text"
          width="90%"
          height={16}
          sx={styles.box}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={16}
          sx={styles.lastBox}
        />
      </Box>
    </Paper>
  );
};

export default ReferenceCardSkeleton;
