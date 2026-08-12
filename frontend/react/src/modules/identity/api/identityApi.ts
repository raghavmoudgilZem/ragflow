/*
Note: This code is for project scaffolding only. Actual services are currently in development.
*/
import axios from 'axios';
import type { LoginFormData } from '../types/identity.types';
import type { UpdateProfilePayload } from '../store/useAuthStore';

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000')) {
    return 'http://localhost:4000';
  }
  return '';
};

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const loginApi = async (credentials: Omit<LoginFormData, 'rememberMe'>) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await axios.post(`${baseUrl}/api/v1/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('Unauthorized: Invalid email or password configuration.');
      }
      if (status === 403) {
        throw new Error('Forbidden: Your account does not have authorization access.');
      }
      throw new Error(error.response.data?.error || 'Authentication processing failure.');
    }
    throw new Error('Network error: Gateway connection dropped.');
  }
};

export const updateUserProfileApi = async (payload: UpdateProfilePayload) => {
  const baseUrl = getApiBaseUrl();
  return axios.put(`${baseUrl}/api/v1/user/profile`, payload, {
    headers: getAuthHeaders(),
  });
};

export const updateUserPasswordApi = async (currentPassword: string, newPassword: string) => {
  const baseUrl = getApiBaseUrl();
  return axios.put(
    `${baseUrl}/api/v1/user/password`,
    { currentPassword, newPassword },
    { headers: getAuthHeaders() }
  );
};

export const uploadUserAvatarApi = async (file: File) => {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('avatar', file);

  const token = sessionStorage.getItem('accessToken');
  return axios.post(`${baseUrl}/api/v1/user/avatar`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};