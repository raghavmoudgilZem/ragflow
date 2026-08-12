// pages/datasets/components/DatasetGrid/index.tsx
/**
 * @author Shruthi
 */
import React, { memo } from 'react';
import { Grid } from '@mui/material';
import DatasetCardSkeleton from '../SkeletonCard';
import DatasetEmptyState from '../EmptyState';
import type { IDataset } from '../../types/dataset.types';
import { useDatasetUiStore } from '../../store/useDatasetUiStore';


interface DatasetGridProps {
  datasets: IDataset[];
  isLoading: boolean;
  isError: boolean;
  total: number;
}

const DatasetGrid: React.FC<DatasetGridProps> = ({ datasets, isLoading, isError, total }) => {
  // need this stores for dataset card 
  // const selectedIds = useDatasetUiStore((state) => state.selectedIds);
  // const toggleSelectedId = useDatasetUiStore((state) => state.toggleSelectedId);
  // const openDialog = useDatasetUiStore((state) => state.openDialog);
  // const page = useDatasetUiStore((state) => state.page);
  const pageSize = useDatasetUiStore((state) => state.pageSize);
  // const setPage = useDatasetUiStore((state) => state.setPage);
  // const setPageSize = useDatasetUiStore((state) => state.setPageSize);
  const ERROR_MESSAGE = "Something went wrong. Try again.";

  if (isLoading) {
    return (
      <Grid container spacing={2} data-testid="dataset-grid-skeleton">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Grid item key={i}><DatasetCardSkeleton /></Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return <div role="alert" data-testid="dataset-grid-error">{ERROR_MESSAGE}</div>;
  }

  if (!isLoading && total === 0) {
    return <DatasetEmptyState icon={undefined} message="No datasets found." onAddClick={() => { }} />;
  }

  return (
    <>
      {/* dataset Cards coming soon */}

    </>
  );
};

export default memo(DatasetGrid);