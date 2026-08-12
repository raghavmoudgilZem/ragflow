/**
 * @author Shruthi
 * @description Skeleton placeholder matching DatasetCard dimensions.
 *              Displayed during initial list fetch (isLoading=true).
 */

import React, { memo } from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';



const DatasetCardSkeleton: React.FC = () => {
 

  return (
    <Card 
    sx={(theme) => ({
      backgroundColor: '#1e1e1e',
    border: '1px solid #2d2d2d',
    borderRadius: 8,
    minWidth: 240,
    })}
     data-testid="dataset-card-skeleton">
      <CardContent 
      sx={(theme) => ({
        padding: '12px 14px !important',
      })}
      >
        <Box 
        sx={(theme) => ({
          display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
        })}
        >
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={120} height={18} />
        </Box>
        <Skeleton variant="text" width={60} height={14} style={{ marginLeft: 42 }} />
        <Skeleton variant="text" width={140} height={14} style={{ marginLeft: 42 }} />
      </CardContent>
    </Card>
  );
};

export default memo(DatasetCardSkeleton);
