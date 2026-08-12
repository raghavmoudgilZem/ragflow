import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { styles } from './skeleton.style';

const AISummarySkeleton: React.FC = () => {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Skeleton
        variant="text"
        width="60%"
        height={24}
        sx={styles.summarybox}
      />
      <Skeleton
        variant="text"
        width="90%"
        height={20}
        sx={styles.summarybox}
      />
      <Skeleton
        variant="text"
        width="85%"
        height={20}
        sx={styles.summarybox}
      />
      <Skeleton
        variant="text"
        width="70%"
        height={20}
        sx={styles.box}
      />
    </Box>
  );
};

export default AISummarySkeleton;
