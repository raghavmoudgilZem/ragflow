import { describe, expect, it } from 'vitest';

import { adaptDatasetListResponse } from './dataset.adapter';

import type {
  IDataset,
  IDatasetListResponse,
} from '../types/dataset.types';

import type { IDatasetListData } from '../types/dataset.raw.types';

const createDataset = (
  overrides: Partial<IDataset> = {},
): IDataset => ({
  id: 'dataset-1',
  name: 'Dataset One',
  description: 'Dataset Description',
  embedding_model: 'nomic-embed-text',
  parser_type: 'qa',
  permission: 'me',
  file_count: 5,
  tenant_id: 'tenant-1',
  owner_name: 'john@test.com',
  owner_avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

describe('adaptDatasetListResponse', () => {
  it('should map dataset list response', () => {
    const raw: IDatasetListData = {
      list: [createDataset()],
      total: 1,
      current_page: 1,
      page_size: 10,
    };

    const result = adaptDatasetListResponse(raw);

    expect(result).toEqual<IDatasetListResponse>({
      list: [createDataset()],
      total: 1,
      current_page: 1,
      page_size: 10,
    });
  });

  it('should return an empty list', () => {
    const raw: IDatasetListData = {
      list: [],
      total: 0,
      current_page: 1,
      page_size: 10,
    };

    const result = adaptDatasetListResponse(raw);

    expect(result).toEqual({
      list: [],
      total: 0,
      current_page: 1,
      page_size: 10,
    });
  });

  it('should preserve pagination values', () => {
    const raw: IDatasetListData = {
      list: [
        createDataset(),
        createDataset({
          id: 'dataset-2',
          name: 'Dataset Two',
        }),
      ],
      total: 25,
      current_page: 3,
      page_size: 20,
    };

    const result = adaptDatasetListResponse(raw);

    expect(result.total).toBe(25);
    expect(result.current_page).toBe(3);
    expect(result.page_size).toBe(20);
    expect(result.list).toHaveLength(2);
  });

  it('should preserve dataset objects without modification', () => {
    const dataset = createDataset({
      name: 'Custom Dataset',
      file_count: 15,
    });

    const raw: IDatasetListData = {
      list: [dataset],
      total: 1,
      current_page: 1,
      page_size: 10,
    };

    const result = adaptDatasetListResponse(raw);

    expect(result.list[0]).toBe(dataset);
  });

  it('should preserve the same list reference', () => {
    const list = [createDataset()];

    const raw: IDatasetListData = {
      list,
      total: 1,
      current_page: 1,
      page_size: 10,
    };

    const result = adaptDatasetListResponse(raw);

    expect(result.list).toBe(list);
  });
});