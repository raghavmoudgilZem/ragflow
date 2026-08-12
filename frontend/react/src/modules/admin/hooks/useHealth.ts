import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../api/admin-service";
import type { HealthStatus, UseHealthResult } from "../types/health";
import { useMemo, useState } from "react";

const AUTO_REFRESH_INTERVAL_MS = 30000; // 5 minutes



export const useHealth = (): UseHealthResult => {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["system-health"],
    queryFn: getSystemHealth,
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL_MS : false,
    refetchOnWindowFocus: false,
  });

  const mappedData = useMemo<HealthStatus[]>(() => {
    if (!response) return [];

    const { data } = response;

    return [...data.services, ...data.dependencies].map((item) => ({
      id: item.id,
      name: item.displayName,
      category: item.category,
      status: item.status,
      responseTime: item.responseTime,
      version: item.version,
      lastUpdated: data.lastUpdated,
    }));
  }, [response]);

  return {
    data: mappedData,
    loading: isLoading,
    error: error ? "Failed to fetch system health." : null,
    lastUpdated: response ? new Date(response.data.lastUpdated) : null,
    overallStatus: response?.data.overallStatus ?? null,
    autoRefresh,
    setAutoRefresh,
    refresh: refetch,
  };
};
