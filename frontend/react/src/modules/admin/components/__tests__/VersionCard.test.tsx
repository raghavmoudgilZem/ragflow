import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VersionCard from "../VersionCard";
import type { HealthStatus } from "../../types/health";

const versions: HealthStatus[] = [
  {
    id: "1",
    name: "Frontend",
    category: "SERVICE",
    status: "UP",
    responseTime: 25,
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "MySQL",
    category: "DATABASE",
    status: "UP",
    responseTime: 12,
    version: "8.0.36",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Redis",
    category: "CACHE",
    status: "UP",
    responseTime: 8,
    version: "7.2.4",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "MinIO",
    category: "STORAGE",
    status: "UP",
    responseTime: 15,
    version: "2025.01",
    lastUpdated: new Date().toISOString(),
  },
];

describe("VersionCard", () => {
  it("renders all component names and versions", () => {
    render(<VersionCard versions={versions} />);

    versions.forEach(({ name, version }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(version)).toBeInTheDocument();
    });
  });
});