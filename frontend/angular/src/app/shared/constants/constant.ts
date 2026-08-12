import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
  },
  ADMIN: {
    SERVICES: `${BASE_URL}/admin/services`,
  },
};

export const ROUTE_PATHS = {
  DASHBOARD: 'dashboard',
};

export const FILE_UPLOAD = {
  ACCEPTED_FILE_TYPES: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv',
};
