// src/utils/chartConfig.ts

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import type { HealthStatus } from "../types/health";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export const getDoughnutData = (services: HealthStatus[]) => {
  const upCount = services.filter(
    (s) => s.status === "Healthy"
  ).length;

  const downCount = services.length - upCount;

  return {
    labels: ["Online", "Offline"],
    datasets: [
      {
        data: [upCount, downCount],
        backgroundColor: ["#2e7d32", "#d32f2f"],
        borderWidth: 0,
      },
    ],
  };
};

export const getBarData = (services: HealthStatus[]) => {
  return {
    labels: services.map((s) => s.name),
    datasets: [
      {
        label: "Response Time (ms)",
        data: services.map((s) => s.responseTime ?? 0),
        backgroundColor: services.map((s) =>
          s.status === "Healthy"
            ? "#1976d2"
            : "#bdbdbd"
        ),
        borderRadius: 6,
      },
    ],
  };
};

export const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "ms",
      },
    },
  },
};

export const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};