import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/envelope';
import type { CreateSearchPayload, PaginatedSearchResponse, SearchAppItem, SearchAppsQueryParams, SearchConfigResponse, UpdateConfigPayload } from '../types/search.types';

const SEARCH_SERVICE_BASE_URL = import.meta.env.VITE_SEARCH_SERVICE_BASE_URL || 'http://localhost:9407';

export const searchApi = {
  createConfig: (searchData: CreateSearchPayload) => {
    // Using apiClient directly allows it to wrap the output in your ApiResponse envelope
    return apiClient.post<SearchConfigResponse>(
      'api/v1/searches',
      searchData, {
      baseURL: SEARCH_SERVICE_BASE_URL
    });
  },
  deleteConfig: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/searches/${id}`, {
      baseURL: SEARCH_SERVICE_BASE_URL
    });
  },
  getAllConfigs: (params: SearchAppsQueryParams) => {
    return apiClient.get<PaginatedSearchResponse>('/api/v1/searches', {
      // Axios maps object properties straight into URL query strings (?page=1&page_size=10...)
      baseURL: SEARCH_SERVICE_BASE_URL,
      params: {
        page: params.page,
        pageSize: params.pageSize,
        keyword: params.search,
      },
    });
  },
  getConfigById: (id: string) => {
    return apiClient.get<SearchAppItem>(`/api/v1/searches/${id}`, {
      baseURL: SEARCH_SERVICE_BASE_URL
    });
  },
  // Inside your API service object layer setup configuration:
  updateConfig: (payload: UpdateConfigPayload) => {
    return apiClient.patch<ApiResponse<SearchAppItem>>(
      `/api/v1/searches/${payload.search_id}`,
      payload,
      {
        baseURL: SEARCH_SERVICE_BASE_URL,
      }
    );
  },

};
