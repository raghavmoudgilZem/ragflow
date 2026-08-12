import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthCard from "../HealthCard";
import type { HealthStatus } from "../../types/health";

const baseService: HealthStatus = {
  id: "1",
  name: "MySQL",
  category: "DATABASE",
  status: "Healthy",
  responseTime: 14,
  version: "8.0",
  lastUpdated: new Date().toISOString(),
};

describe("HealthCard", () => {
  it("renders the service name", () => {
    render(<HealthCard service={baseService} />);

    expect(screen.getByText("MySQL")).toBeInTheDocument();
  });

  it("shows ping time when the service is UP", () => {
    render(<HealthCard service={baseService} />);

    expect(screen.getByText(/Ping:\s*14\s*ms/i)).toBeInTheDocument();
  });

  it("shows 'Unavailable' when the service is DOWN", () => {
    const downService: HealthStatus = {
      ...baseService,
      name: "MinIO",
      status: "DOWN",
      responseTime: 45,
    };

    render(<HealthCard service={downService} />);

    expect(screen.getByText(/Unavailable/i)).toBeInTheDocument();
  });
});
