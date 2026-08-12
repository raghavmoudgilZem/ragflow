import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../../modules/identity/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === '/api/v1/auth/refresh') {
      handleSessionExpiration();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (!refreshToken) {
      handleSessionExpiration();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post('/api/v1/auth/refresh', { refreshToken }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { accessToken, newRefreshToken } = response.data;

      sessionStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);

    } catch (refreshError) {
      handleSessionExpiration();
      return Promise.reject(refreshError);
    }
  }
);

function handleSessionExpiration() {
  const currentPath = window.location.pathname + window.location.search;
  const preservedUrl = encodeURIComponent(currentPath);

  try {
    useAuthStore.getState().logoutAction();
  } catch (e) {
    console.error("Zustand memory layer reference mapping not available yet during eviction initialization:", e);
  }
  window.location.href = `/login-next?redirect=${preservedUrl}`;
}