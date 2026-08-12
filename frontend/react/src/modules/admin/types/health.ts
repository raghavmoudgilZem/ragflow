export type ServiceStatus = "Healthy" | "Degraded";

export interface HealthStatus {
  id: string;
  name: string;
  category: string;
  status: string;
  responseTime: number;
  version: string;
  message?: string;
  lastUpdated?:string
}
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginData {
  id: string;
  email: string;
  name: string;
  roles: string[];
  access_token: string;
  refresh_token: string;
  expiresIn: number;
}

export interface AdminLoginResponse {
  success: boolean;
  errors: string[];
  data: AdminLoginData;
}
export interface ErrorResponse {
  success: boolean;
  errors?: string[];
  message?: string;
  data: null;
}

export interface MockResponse {
  data: {
    overallStatus: string;
    lastUpdated: string;
    services: {
      id: string;
      displayName: string;
      category: string;
      status: string;
      responseTime: number;
      version: string;
    }[];
    dependencies: {
      id: string;
      displayName: string;
      category: string;
      status: string;
      responseTime?: number;
      version?: string;
    }[];
  };
}
export interface UseHealthResult {
  data: HealthStatus[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date |null;
  overallStatus: string | null;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  refresh: () => void;
}
 export type MockService = {
  id: string;
  name: string;
  category: string;
  status: string;
  responseTime: number;
  version: string;
  lastUpdated: string;
};
