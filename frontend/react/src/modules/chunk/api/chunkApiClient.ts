import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@shared/api/client';

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';
const CHUNK_API_BASE =
  import.meta.env.VITE_CHUNK_API_BASE_URL || DEFAULT_API_BASE_URL;

const withChunkBase = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
  ...config,
  baseURL: CHUNK_API_BASE,
});

export const chunkApiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, withChunkBase(config)),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, withChunkBase(config)),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, withChunkBase(config)),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, withChunkBase(config)),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, withChunkBase(config)),
};
