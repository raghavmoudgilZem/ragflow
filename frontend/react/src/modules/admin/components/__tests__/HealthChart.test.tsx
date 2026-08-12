import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthChart from "../HealthChart";
import type { HealthStatus } from "../../types/health";

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
  Bar: () => <div data-testid="mock-bar" />,
}));

const services: HealthStatus[] = [
  {
    id: "1",
    name: "MySQL",
    category: "DATABASE",
    status: "UP",
    responseTime: 12,
    version: "8.0",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "MinIO",
    category: "STORAGE",
    status: "DOWN",
    responseTime: 54,
    version: "2025.01",
    lastUpdated: new Date().toISOString(),
  },
];

describe("HealthChart", () => {
  it("renders chart section title and chart placeholders", () => {
    render(<HealthChart services={services} />);

    expect(
      screen.getByText(/System Health Overview/i)
    ).toBeInTheDocument();

    expect(screen.getByTestId("mock-doughnut")).toBeInTheDocument();
    expect(screen.getByTestId("mock-bar")).toBeInTheDocument();
  });
});
