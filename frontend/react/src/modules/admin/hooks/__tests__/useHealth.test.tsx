import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import { useHealth } from "../useHealth";
import * as service from "../../api/admin-service";

vi.mock("../../api/admin-service");

const mockResponse: AxiosResponse = {
  data: {
    overallStatus: "Healthy",
    lastUpdated: new Date().toISOString(),

    services: [
      {
        id: "1",
        displayName: "MySQL",
        category: "database",
        status: "Healthy",
        responseTime: 10,
        version: "8.0",
      },
    ],

    dependencies: [],
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {
    headers: new AxiosHeaders(),
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useHealth", () => {
  beforeEach(() => {
    vi.mocked(service.getSystemHealth).mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and map health data", async () => {
    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data.length).toBe(1);
    });

    expect(result.current.data[0]).toEqual({
      id: "1",
      name: "MySQL",
      category: "database",
      status: "Healthy",
      responseTime: 10,
      version: "8.0",
      lastUpdated: mockResponse.data.lastUpdated,
    });
  });

  it("should return overall status and last updated time", async () => {
    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.overallStatus).toBe("Healthy");
    });

    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it("should refresh data manually", async () => {
    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data.length).toBe(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(service.getSystemHealth).toHaveBeenCalledTimes(2);
  });

  it("should return error when api fails", async () => {
    vi.mocked(service.getSystemHealth).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch system health.");
    });
  });

  it("should allow toggling auto refresh", async () => {
    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.autoRefresh).toBe(true);

    act(() => {
      result.current.setAutoRefresh(false);
    });

    expect(result.current.autoRefresh).toBe(false);
  });
});
