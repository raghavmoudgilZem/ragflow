import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../../../shared/api/client';
import { datasetApi } from './datasetService';

import type { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginatedData,
} from '../../../shared/api/envelope';

import type {
  IDataset,
  IDatasetListFilters,
} from '../types/dataset.types';

vi.mock('../../../shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createDataset = (
  owner: string,
  overrides: Partial<IDataset> = {},
): IDataset => ({
  id: crypto.randomUUID(),
  name: 'Dataset',
  description: 'Dataset Description',
  embedding_model: 'nomic-embed-text',
  parser_type: 'qa',
  permission: 'me',
  file_count: 5,
  tenant_id: 'tenant-123',
  owner_name: owner,
  owner_avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const createPaginatedResponse = (
  list: IDataset[],
): AxiosResponse<ApiResponse<PaginatedData<IDataset>>> => ({
  data: {
    success: true,
    status_code: 200,
    errors: [],
    data: {
      list,
      total: list.length,
      current_page: 1,
      page_size: list.length,
    },
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as never,
});

describe('datasetApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should call list endpoint with filters', async () => {
      const filters: IDatasetListFilters = {
        search: 'dataset',
        page: 2,
        pageSize: 20,
        owners: ['owner-1'],
      };

      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([]),
      );

      await datasetApi.list(filters);

      expect(apiClient.post).toHaveBeenCalledOnce();

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset/list',
        undefined,
        {
          params: {
            keywords: 'dataset',
            page: 2,
            page_size: 20,
            owner_ids: ['owner-1'],
          },
        },
      );
    });

    it('should omit owner_ids when owners are empty', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([]),
      );

      await datasetApi.list({
        search: '',
        page: 1,
        pageSize: 10,
        owners: [],
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset/list',
        undefined,
        {
          params: {
            keywords: '',
            page: 1,
            page_size: 10,
          },
        },
      );
    });

    it('should omit owner_ids when owners are undefined', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([]),
      );

      await datasetApi.list({
        search: '',
        page: 1,
        pageSize: 10,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset/list',
        undefined,
        {
          params: {
            keywords: '',
            page: 1,
            page_size: 10,
          },
        },
      );
    });

    it('should default search to empty string', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([]),
      );

      await datasetApi.list({
        search: undefined as unknown as string,
        page: 1,
        pageSize: 10,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset/list',
        undefined,
        {
          params: {
            keywords: '',
            page: 1,
            page_size: 10,
          },
        },
      );
    });

    it('should propagate api errors', async () => {
      const error = new Error('Network Error');

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        datasetApi.list({
          search: '',
          page: 1,
          pageSize: 10,
        }),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('listOwners', () => {
    it('should aggregate owners correctly', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([
          createDataset('alice@test.com'),
          createDataset('alice@test.com'),
          createDataset('bob@test.com'),
        ]),
      );

      const owners = await datasetApi.listOwners();

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset/list',
        undefined,
        {
          params: {
            keywords: '',
            page: 1,
            page_size: 999,
          },
        },
      );

      expect(owners).toEqual([
        {
          email: 'alice@test.com',
          count: 2,
        },
        {
          email: 'bob@test.com',
          count: 1,
        },
      ]);
    });

    it('should aggregate multiple owners correctly', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([
          createDataset('alice@test.com'),
          createDataset('alice@test.com'),
          createDataset('alice@test.com'),
          createDataset('bob@test.com'),
          createDataset('charlie@test.com'),
          createDataset('charlie@test.com'),
        ]),
      );

      const owners = await datasetApi.listOwners();

      expect(owners).toEqual([
        {
          email: 'alice@test.com',
          count: 3,
        },
        {
          email: 'bob@test.com',
          count: 1,
        },
        {
          email: 'charlie@test.com',
          count: 2,
        },
      ]);
    });

    it('should return empty owner list', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(
        createPaginatedResponse([]),
      );

      const owners = await datasetApi.listOwners();

      expect(owners).toEqual([]);
    });

    it('should propagate api errors', async () => {
      const error = new Error('Failed to fetch owners');

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        datasetApi.listOwners(),
      ).rejects.toThrow('Failed to fetch owners');
    });
  });

  describe('getById', () => {
    it('should call get endpoint', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com'),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.getById('dataset-123');

      expect(apiClient.get).toHaveBeenCalledOnce();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/dataset/dataset-123',
      );
    });

    it('should propagate api errors', async () => {
      const error = new Error('Failed to fetch dataset');

      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(
        datasetApi.getById('dataset-123'),
      ).rejects.toThrow('Failed to fetch dataset');
    });
  });
    describe('create', () => {
    it('should call create endpoint with payload', async () => {
      const payload = {
        name: 'New Dataset',
        description: 'Dataset Description',
        embedding_model: 'nomic-embed-text',
        parser_type: 'qa',
        chunking_method: 'manual',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com'),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.create(payload);

      expect(apiClient.post).toHaveBeenCalledOnce();

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset',
        payload,
      );
    });

    it('should create dataset without optional fields', async () => {
      const payload = {
        name: 'New Dataset',
        embedding_model: 'nomic-embed-text',
        parser_type: 'qa',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com'),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.create(payload);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/dataset',
        payload,
      );
    });

    it('should propagate api errors', async () => {
      const payload = {
        name: 'New Dataset',
        embedding_model: 'nomic-embed-text',
        parser_type: 'qa',
      };

      const error = new Error('Failed to create dataset');

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        datasetApi.create(payload),
      ).rejects.toThrow('Failed to create dataset');
    });
  });

  describe('update', () => {
    it('should call update endpoint with partial payload', async () => {
      const payload = {
        id: 'dataset-123',
        name: 'Updated Dataset',
      };

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com', {
            name: 'Updated Dataset',
          }),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.update(payload);

      expect(apiClient.put).toHaveBeenCalledOnce();

      expect(apiClient.put).toHaveBeenCalledWith(
        '/v1/dataset/dataset-123',
        {
          name: 'Updated Dataset',
        },
      );
    });

    it('should update dataset with all editable fields', async () => {
      const payload = {
        id: 'dataset-123',
        name: 'Updated Dataset',
        description: 'Updated Description',
        embedding_model: 'bge-large',
        parser_type: 'manual',
        chunking_method: 'qa',
      };

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com'),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.update(payload);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/v1/dataset/dataset-123',
        {
          name: 'Updated Dataset',
          description: 'Updated Description',
          embedding_model: 'bge-large',
          parser_type: 'manual',
          chunking_method: 'qa',
        },
      );
    });

    it('should update only description', async () => {
      const payload = {
        id: 'dataset-123',
        description: 'Only Description Changed',
      };

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: createDataset('owner@test.com'),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.update(payload);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/v1/dataset/dataset-123',
        {
          description: 'Only Description Changed',
        },
      );
    });

    it('should propagate api errors', async () => {
      const error = new Error('Failed to update dataset');

      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        datasetApi.update({
          id: 'dataset-123',
          name: 'Updated Dataset',
        }),
      ).rejects.toThrow('Failed to update dataset');
    });
  });

  describe('remove', () => {
    it('should call delete endpoint', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: {
            deleted_ids: ['dataset-123'],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.remove('dataset-123');

      expect(apiClient.delete).toHaveBeenCalledOnce();

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/v1/dataset',
        {
          data: {
            ids: ['dataset-123'],
          },
        },
      );
    });

    it('should send only one id in delete payload', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: {
          success: true,
          status_code: 200,
          errors: [],
          data: {
            deleted_ids: ['abc-123'],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await datasetApi.remove('abc-123');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/v1/dataset',
        {
          data: {
            ids: ['abc-123'],
          },
        },
      );
    });

    it('should propagate api errors', async () => {
      const error = new Error('Failed to delete dataset');

      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(
        datasetApi.remove('dataset-123'),
      ).rejects.toThrow('Failed to delete dataset');
    });
  });
});