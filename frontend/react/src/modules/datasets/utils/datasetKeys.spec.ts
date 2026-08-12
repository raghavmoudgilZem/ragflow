// datasetKeys.spec.ts

import { describe, expect, it } from 'vitest';

import { DatasetKeys } from './datasetKeys';
import type { IDatasetListFilters } from '../types/dataset.types';

describe('DatasetKeys', () => {
  it('should return the root query key', () => {
    expect(DatasetKeys.all()).toEqual(['datasets']);
  });

  it('should return the list root query key', () => {
    expect(DatasetKeys.lists()).toEqual([
      'datasets',
      'list',
    ]);
  });

  it('should return the filtered list query key', () => {
    const filters: IDatasetListFilters = {
      search: 'knowledge',
      page: 2,
      pageSize: 20,
      owners: ['owner-1', 'owner-2'],
    };

    expect(DatasetKeys.list(filters)).toEqual([
      'datasets',
      'list',
      filters,
    ]);
  });

  it('should return the detail query key', () => {
    expect(DatasetKeys.detail('dataset-123')).toEqual([
      'datasets',
      'detail',
      'dataset-123',
    ]);
  });

  it('should return the owners query key', () => {
    expect(DatasetKeys.owners()).toEqual([
      'datasets',
      'owners',
    ]);
  });

  it('should create stable query keys for identical filters', () => {
    const filters: IDatasetListFilters = {
      search: '',
      page: 1,
      pageSize: 10,
      owners: [],
    };

    expect(DatasetKeys.list(filters)).toEqual(
      DatasetKeys.list(filters),
    );
  });

  it('should generate different keys for different filters', () => {
    const firstFilters: IDatasetListFilters = {
      search: 'dataset',
      page: 1,
      pageSize: 10,
      owners: [],
    };

    const secondFilters: IDatasetListFilters = {
      search: 'knowledge',
      page: 1,
      pageSize: 10,
      owners: [],
    };

    expect(DatasetKeys.list(firstFilters)).not.toEqual(
      DatasetKeys.list(secondFilters),
    );
  });
});