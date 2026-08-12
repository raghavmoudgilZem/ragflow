import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@shared/hooks/useDebounceHook';
import { ROUTES } from '@modules/identity/constants/routes';
import { ChunkCard } from '../components/ChunkCard';
import { ChunkPagination } from '../components/ChunkPagination';
import { ChunkToolbar } from '../components/ChunkToolbar';
import { CreateChunkDialog } from '../components/CreateChunkDialog';
import { DocumentPreviewPanel } from '../components/DocumentPreviewPanel';
import { useChunks } from '../hooks/useChunks';
import { useDocumentDetail } from '../hooks/useDocumentDetail';
import { useToggleChunkEnabled } from '../hooks/useToggleChunkEnabled';
import { useBulkToggleChunksEnabled } from '../hooks/useBulkToggleChunksEnabled';
import { useBulkDeleteChunks } from '../hooks/useBulkDeleteChunks';
import { useChunkSelection } from '../hooks/useChunkSelection';
import type { ChunkEnabledFilter, ChunkViewMode } from '../types/chunk.types';

// Constants
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_TOTAL_PAGES = 1;

// Text constants
const DEFAULT_DATASET_LABEL = 'Dataset';
const MISSING_DOCUMENT_MESSAGE = 'Missing document id. Open a file from a dataset.';
const DOCUMENT_NOT_FOUND_MESSAGE = 'Document not found';
const CHUNK_RESULT_TITLE = 'Chunk result';
const CHUNK_RESULT_DESCRIPTION =
  'View the chunked segments used for embedding and retrieval.';
const BREADCRUMB_DATASET_LABEL = 'Dataset';
const BREADCRUMB_SEPARATOR = '>';
const NO_CHUNKS_AVAILABLE = 'No Chunks Available';

export default function ChunkListPage() {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('id') ?? '';
  const documentId = searchParams.get('doc_id') ?? '';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ChunkViewMode>('full');
  const [enabledFilter, setEnabledFilter] = useState<ChunkEnabledFilter>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Optimistic enabled-state overrides, keyed by chunkId. Takes precedence over
  // the value returned by the query, so per-card Switch reflects clicks
  // instantly before the server mutation resolves + query invalidates.
  //
  // Cleared via useEffect below (declared AFTER items derivation) when the
  // refetched authoritative items list contains the same enabled value we
  // optimistically set. This prevents the "switch flips then instantly reverts"
  // symptom caused by clearing pending override onSuccess/onError before the
  // cache actually re-reads the new value.
  const [pendingEnabled, setPendingEnabled] = useState<Record<string, boolean>>({});

  const applyPending = (chunkIds: string[], value: boolean) => {
    setPendingEnabled((prev) => {
      const next = { ...prev };
      for (const id of chunkIds) next[id] = value;
      return next;
    });
  };

  const {
    selectedIds,
    toggle,
    selectAll,
    clear,
    isAllSelected,
    isSomeSelected,
  } = useChunkSelection();

  const debouncedSearch = useDebounce(search, 400);

  const enabledParam =
    enabledFilter === 'all' ? undefined : enabledFilter === 'enabled';

  useEffect(() => {
    setPage(1);
    clear();
  }, [documentId, debouncedSearch, pageSize, enabledFilter, clear]);

  const {
    data: documentDetail,
    isPending: docLoading,
    error: docError,
  } = useDocumentDetail(documentId || undefined);

  const {
    data: chunkPage,
    isPending: chunksLoading,
    error: chunksError,
  } = useChunks(
    {
      documentId,
      page,
      pageSize,
      search: debouncedSearch || undefined,
      enabled: enabledParam,
    },
    Boolean(documentId),
  );

  const toggleEnabled = useToggleChunkEnabled();
  const bulkToggleEnabled = useBulkToggleChunksEnabled();
  const bulkDeleteChunks = useBulkDeleteChunks({
    onSuccess: () => {
      clear();
    },
  });
  const items = chunkPage?.items ?? [];
  const totalItems = chunkPage?.totalItems ?? 0;
  const totalPages = chunkPage?.totalPages ?? DEFAULT_TOTAL_PAGES;

  // When the items array from the query changes (e.g. after an invalidate +
  // refetch triggered by a mutation's onSuccess), clear any pending overrides
  // that now match the authoritative server value. Pending entries stay in
  // place if server hasn't reflected the change yet — prevents switch reverting.
  useEffect(() => {
    if (items.length === 0 || Object.keys(pendingEnabled).length === 0) return;
    let needsUpdate = false;
    const nextPending: Record<string, boolean> = { ...pendingEnabled };
    for (const chunk of items) {
      if (
        Object.prototype.hasOwnProperty.call(nextPending, chunk.id) &&
        nextPending[chunk.id] === (chunk.enabled ?? true)
      ) {
        delete nextPending[chunk.id];
        needsUpdate = true;
      }
    }
    if (needsUpdate) setPendingEnabled(nextPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const allSelected = isAllSelected(items);

  const datasetHref = datasetId
    ? `/dataset/dataset/${datasetId}`
    : ROUTES.DATASETS;

  const datasetLabel = useMemo(
    () => documentDetail?.datasetName ?? DEFAULT_DATASET_LABEL,
    [documentDetail?.datasetName],
  );

  if (!documentId) {
    return (
      <Box sx={{ p: 4, color: 'var(--text)' }}>
        <Typography>{MISSING_DOCUMENT_MESSAGE}</Typography>
      </Box>
    );
  }

  if (docLoading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'var(--chunk-text-muted)' }} />
      </Box>
    );
  }

  if (docError || !documentDetail) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">
          {docError?.message ?? DOCUMENT_NOT_FOUND_MESSAGE}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%', // Explicit height
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--chunk-page-bg)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 3, pt: 2, pb: 1, flexShrink: 0 }}>
        <Breadcrumbs
          separator={BREADCRUMB_SEPARATOR}
          sx={{ '& .MuiBreadcrumbs-separator': { color: 'var(--chunk-text-muted)', mx: 0.75 } }}
        >
          <MuiLink
            component={Link}
            to={ROUTES.DATASETS}
            underline="hover"
            sx={{ color: 'var(--chunk-text-muted)', fontSize: '0.875rem' }}
          >
            {BREADCRUMB_DATASET_LABEL}
          </MuiLink>
          <MuiLink
            component={Link}
            to={datasetHref}
            underline="hover"
            sx={{ color: 'var(--chunk-text-muted)', fontSize: '0.875rem' }}
          >
            {datasetLabel}
          </MuiLink>
          <Typography sx={{ color: 'var(--chunk-text-h)', fontSize: '0.875rem' }}>
            {documentDetail.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '40% 60%' },
          gap: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left panel (Document Preview / PDF - 40%) */}
        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            px: 3,
            py: 2,
          }}
        >
          <DocumentPreviewPanel documentDetail={documentDetail} />
        </Box>

        {/* Right panel (Chunks Result - 60%) */}
        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            px: 3,
            py: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flexShrink: 0, mb: 1.5 }}>
            <Typography
              sx={{ color: 'var(--chunk-text-h)', fontWeight: 700, fontSize: '1.35rem' }}
            >
              {CHUNK_RESULT_TITLE}
            </Typography>
            <Typography sx={{ color: 'var(--chunk-text-muted)', fontSize: '0.875rem', mt: 0.5 }}>
              {CHUNK_RESULT_DESCRIPTION}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'var(--chunk-panel-bg)',
              border: '1px solid var(--chunk-panel-border)',
              borderRadius: 2.5,
              p: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flexShrink: 0, mb: 2 }}>
              <ChunkToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                search={search}
                onSearchChange={setSearch}
                enabledFilter={enabledFilter}
                onEnabledFilterChange={setEnabledFilter}
                selectAll={allSelected}
                someSelected={isSomeSelected(items)}
                onSelectAllChange={(checked) => {
                  selectAll(items, checked);
                }}
                selectedCount={selectedIds.size}
                onEnableSelected={() => {
                  const chunkIds = Array.from(selectedIds);
                  if (chunkIds.length === 0) return;
                  applyPending(chunkIds, true);
                  bulkToggleEnabled.mutate({ chunkIds, enabled: true });
                }}
                onDisableSelected={() => {
                  const chunkIds = Array.from(selectedIds);
                  if (chunkIds.length === 0) return;
                  applyPending(chunkIds, false);
                  bulkToggleEnabled.mutate({ chunkIds, enabled: false });
                }}
                onDeleteSelected={() => {
                  const chunkIds = Array.from(selectedIds);
                  if (chunkIds.length === 0) return;
                  bulkDeleteChunks.mutate({ chunkIds });
                }}
                enableSelectedDisabled={bulkToggleEnabled.isPending || selectedIds.size === 0}
                disableSelectedDisabled={bulkToggleEnabled.isPending || selectedIds.size === 0}
                deleteSelectedDisabled={bulkDeleteChunks.isPending || selectedIds.size === 0}
                onAddClick={() => setCreateDialogOpen(true)}
              />
            </Box>

            <Box className="chunk-scroll" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5, mb: 2 }}>
              {chunksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={28} sx={{ color: 'var(--chunk-text-muted)' }} />
                </Box>
              ) : chunksError ? (
                <Typography color="error">{chunksError.message}</Typography>
              ) : items.length === 0 ? (
                <Typography sx={{ color: 'var(--chunk-text-muted)', py: 4, textAlign: 'center' }}>
                  {NO_CHUNKS_AVAILABLE}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {items.map((chunk) => {
                    const effectiveEnabled =
                      pendingEnabled[chunk.id] !== undefined
                        ? pendingEnabled[chunk.id]
                        : chunk.enabled ?? true;
                    return (
                      <ChunkCard
                        key={chunk.id}
                        chunk={{ ...chunk, enabled: effectiveEnabled }}
                        viewMode={viewMode}
                        documentPreviewTitle={documentDetail.previewTitle}
                        selected={selectedIds.has(chunk.id)}
                        onSelectChange={(checked) => toggle(chunk.id, checked)}
                        onEnabledChange={(enabled) => {
                          applyPending([chunk.id], enabled);
                          toggleEnabled.mutate({ chunkId: chunk.id, enabled });
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            <ChunkPagination
              totalItems={totalItems}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </Box>
        </Box>
      </Box>

      <CreateChunkDialog
        open={createDialogOpen}
        documentId={documentId}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
}