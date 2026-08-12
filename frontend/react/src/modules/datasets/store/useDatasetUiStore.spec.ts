// useDatasetUiStore.spec.ts

import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_PAGE_SIZE } from '../constants/dataset.constants';
import { useDatasetUiStore } from './useDatasetUiStore';

describe('useDatasetUiStore', () => {
  beforeEach(() => {
    useDatasetUiStore.setState({
      search: '',
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      ownerFilter: [],
      selectedIds: [],
      activeDialog: 'none',
      editingDatasetId: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useDatasetUiStore.getState();

    expect(state.search).toBe('');
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(state.ownerFilter).toEqual([]);
    expect(state.selectedIds).toEqual([]);
    expect(state.activeDialog).toBe('none');
    expect(state.editingDatasetId).toBeNull();
  });

  it('should update search and reset page', () => {
    const { setSearch } = useDatasetUiStore.getState();

    setSearch('dataset');

    const state = useDatasetUiStore.getState();

    expect(state.search).toBe('dataset');
    expect(state.page).toBe(1);
  });

  it('should update page', () => {
    const { setPage } = useDatasetUiStore.getState();

    setPage(3);

    expect(useDatasetUiStore.getState().page).toBe(3);
  });

  it('should update page size and reset page', () => {
    const { setPage, setPageSize } = useDatasetUiStore.getState();

    setPage(5);
    setPageSize(50);

    const state = useDatasetUiStore.getState();

    expect(state.pageSize).toBe(50);
    expect(state.page).toBe(1);
  });

  it('should update owner filter and reset page', () => {
    const { setPage, setOwnerFilter } = useDatasetUiStore.getState();

    setPage(4);
    setOwnerFilter(['owner-1', 'owner-2']);

    const state = useDatasetUiStore.getState();

    expect(state.ownerFilter).toEqual(['owner-1', 'owner-2']);
    expect(state.page).toBe(1);
  });

  it('should add selected id', () => {
    const { toggleSelectedId } = useDatasetUiStore.getState();

    toggleSelectedId('dataset-1');

    expect(useDatasetUiStore.getState().selectedIds).toEqual([
      'dataset-1',
    ]);
  });

  it('should remove selected id when toggled again', () => {
    const { toggleSelectedId } = useDatasetUiStore.getState();

    toggleSelectedId('dataset-1');
    toggleSelectedId('dataset-1');

    expect(useDatasetUiStore.getState().selectedIds).toEqual([]);
  });

  it('should clear selected ids', () => {
    const { toggleSelectedId, clearSelection } =
      useDatasetUiStore.getState();

    toggleSelectedId('dataset-1');
    toggleSelectedId('dataset-2');

    clearSelection();

    expect(useDatasetUiStore.getState().selectedIds).toEqual([]);
  });

  it('should open create dialog', () => {
    const { openDialog } = useDatasetUiStore.getState();

    openDialog('create');

    const state = useDatasetUiStore.getState();

    expect(state.activeDialog).toBe('create');
    expect(state.editingDatasetId).toBeNull();
  });

  it('should open edit dialog with dataset id', () => {
    const { openDialog } = useDatasetUiStore.getState();

    openDialog('edit', 'dataset-123');

    const state = useDatasetUiStore.getState();

    expect(state.activeDialog).toBe('edit');
    expect(state.editingDatasetId).toBe('dataset-123');
  });

  it('should close dialog', () => {
    const { openDialog, closeDialog } =
      useDatasetUiStore.getState();

    openDialog('edit', 'dataset-123');
    closeDialog();

    const state = useDatasetUiStore.getState();

    expect(state.activeDialog).toBe('none');
    expect(state.editingDatasetId).toBeNull();
  });
});