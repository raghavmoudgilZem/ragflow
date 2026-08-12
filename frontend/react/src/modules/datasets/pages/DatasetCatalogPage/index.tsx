/**
 * @author Shruthi D A
 * @description Dataset Catalog page — route entry point for /datasets.
 *              Composition root only: wires EntityListHeader, DatasetGrid,
 *              DatasetOwnerFilter, and all dialogs together.
 *              All business logic lives in useDatasetCatalog and useDatasetUiStore.
 */

import React, { memo, useState } from 'react';
import { Box } from '@mui/material';

import EntityListHeader from '@modules/datasets/components/EntityListHeader';
import DatasetIcon from '../../../../assets/icons/DatasetIcon';
import DatasetGrid from '../../components/DatasetGrid';
// import DatasetOwnerFilter from '../components/DatasetOwnerFilter';
// import DatasetCreateDialog from '../components/DatasetCreateDialog';
// import DatasetRenameDialog from '../components/DatasetRenameDialog';
// import DatasetDeleteConfirmDialog from '../components/DatasetDeleteConfirmDialog';

import { useDatasetCatalog } from '../../hooks/useDatasetCatalog';
import { useDatasetUiStore } from '../../store/useDatasetUiStore';
import labels from '../../constants/datasetLabels.json';
import { useDebounce } from '@shared/hooks/useDebounceHook';


// ── Component ──────────────────────────────────────────────────────────────

const DatasetCatalogPage: React.FC = () => {

  // ── UI state (Zustand) ───────────────────────────────────────────────────

  const search = useDatasetUiStore((state) => state.search);
  const setSearch = useDatasetUiStore((state) => state.setSearch);
  const openDialog = useDatasetUiStore((state) => state.openDialog);

  const debouncedSearch = useDebounce(search, 400);
  // ── Server state + mutations (React Query) ───────────────────────────────
  const {
    datasets,
    total,
    isLoading,
    isError,
    // refetch,
    // isMutating,
    // createDataset,
    // updateDataset,
    // deleteDataset,
  } = useDatasetCatalog({search: debouncedSearch});

  // ── Filter popover anchor ────────────────────────────────────────────────
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

  // ── Derived: dataset being edited / deleted ──────────────────────────────
//   const editingDataset = datasets.find((d) => d.id === editingDatasetId) ?? null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFilterClick = (e: React.MouseEvent<HTMLElement>) =>
    setFilterAnchorEl(e.currentTarget);

//   const handleFilterClose = () => setFilterAnchorEl(null);

//   const handleCreateSubmit = async (payload: Parameters<typeof createDataset>[0]) => {
//     await createDataset(payload);
//     closeDialog();
//   };

//   const handleRenameSubmit = async (name: string) => {
//     if (!editingDatasetId) return;
//     await updateDataset({ id: editingDatasetId, name });
//     closeDialog();
//   };

//   const handleDeleteConfirm = async () => {
//     if (editingDatasetId) {
//       await deleteDataset(editingDatasetId);
//     }
//     closeDialog();
//   };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box data-testid="dataset-catalog-page"
    sx={(theme) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    px: 3, // Equivalent to padding: `0 ${theme.spacing(3)}`
    backgroundColor: theme.palette.background.default,
    overflow: 'hidden',
  })}
    >

      {/* ── Page header: icon + title + filter + search + create ── */}
      <EntityListHeader
        icon={<DatasetIcon />}
        title={labels.pageTitle}
        searchValue={search}
        searchPlaceholder={labels.searchPlaceholder}
        onSearchChange={setSearch}
        onFilterClick={handleFilterClick}
        createLabel={labels.createDataset}
        onCreateClick={() => openDialog('create')}
      />

      {/* ── Owner filter popover ─────────────────────────────────── */}
      

      {/* ── Dataset card grid + pagination ───────────────────────── */}
      <Box sx={(theme) => ({
        flex: 1,
        overflowY: 'auto',
        pb: 3, // Equivalent to theme.spacing(3)
        position: 'relative'
      })}
      >
        <DatasetGrid
          datasets={datasets}
          isLoading={isLoading}
          isError={isError}
          total={total}
          // onRetry={refetch}
        />
      </Box>

      {/* ── Create dataset dialog ─────────────────────────────────── */}
      

      {/* ── Rename dataset dialog ─────────────────────────────────── */}
      

      {/* ── Delete confirmation dialog ────────────────────────────── */}
      
    </Box>
  );
};

export default memo(DatasetCatalogPage);