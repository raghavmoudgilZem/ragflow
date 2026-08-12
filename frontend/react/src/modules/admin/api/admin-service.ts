import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ErrorResponse,
} from "../types/health";

const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_REFRESH_TOKEN_KEY = "admin_refresh_token";
const AUTH_API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : import.meta.env.VITE_PORT;
export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string) =>
  localStorage.setItem(ADMIN_TOKEN_KEY, token);

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

const adminClient: AxiosInstance = axios.create({
  baseURL: `${AUTH_API_BASE}/api/v1/admin`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

adminClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

adminClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;

    const backendMessage =
      error.response?.data?.errors?.[0] ||
      error.response?.data?.message ||
      error.message;

    switch (status) {
      case 400:
        throw new Error(backendMessage);

      case 401:
        clearAdminSession();

        window.location.href = "/admin/login?error=token_expired";

        throw new Error(
          backendMessage || "Your session has expired. Please login again.",
        );

      case 403:
        throw new Error(
          backendMessage || "You don't have permission to access this page.",
        );

      case 404:
        throw new Error(backendMessage || "Service not found.");

      case 429:
        throw new Error(
          backendMessage ||
            "Too many login attempts. Please wait a few minutes and try again.",
        );

      case 500:
        throw new Error(
          backendMessage || "Server error. Please try again later.",
        );

      default:
        throw new Error(backendMessage || "Something went wrong.");
    }
  },
);

export const adminLogin = async (payload: AdminLoginRequest) => {
  const { data } = await adminClient.post<AdminLoginResponse>(
    "/auth/login",
    payload,
  );
  setAdminToken(data.data.access_token);
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, data.data.refresh_token);

  return data;
};
export const refreshAdminToken = async () => {
  const refreshToken = localStorage.getItem(
    ADMIN_REFRESH_TOKEN_KEY
  );

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const { data } = await adminClient.post(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    }
  );

  setAdminToken(data.data.access_token);

  localStorage.setItem(
    ADMIN_REFRESH_TOKEN_KEY,
    data.data.refresh_token
  );

  return data.data;
};
export const adminLogout = async () => {
  const refreshToken = localStorage.getItem(
    ADMIN_REFRESH_TOKEN_KEY
  );

  try {
    await adminClient.post("/auth/logout", {
      refresh_token: refreshToken,
    });
  } finally {
    clearAdminSession();
  }
};
export const getSystemHealth = () => adminClient.get("/monitoring/health");

export default adminClient;
