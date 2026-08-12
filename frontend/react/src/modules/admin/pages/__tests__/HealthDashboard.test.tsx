import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HealthDashboard from "../HealthDashboard";

import { useHealth } from "../../hooks/useHealth";
import { logout } from "../../services/adminAuth";
import type { MockService } from "@modules/admin/types/health";

vi.mock("../../hooks/useHealth", () => ({
  useHealth: vi.fn(),
}));

vi.mock("../../services/adminAuth", () => ({
  logout: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../components/HealthCard", () => ({
  default: ({ service }: { service: MockService }) => (
    <div data-testid="health-card">{service.name}</div>
  ),
}));

vi.mock("../../components/HealthChart", () => ({
  default: () => (
    <div data-testid="health-chart">Health Chart</div>
  ),
}));

vi.mock("../../components/VersionCard", () => ({
  default: () => (
    <div data-testid="version-card">Version Card</div>
  ),
}));

const mockService = {
  id: "1",
  name: "MySQL",
  category: "DATABASE",
  status: "UP",
  responseTime: 12,
  version: "8.0",
  lastUpdated: "2025-01-01T10:00:00.000Z",
};

const defaultHookValue = {
  data: [mockService],
  loading: false,
  error: null,
  overallStatus: "Healthy",
  lastUpdated: new Date("2025-01-01T10:00:00.000Z"),
  autoRefresh: true,
  setAutoRefresh: vi.fn(),
  refresh: vi.fn(),
};

describe("HealthDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useHealth).mockReturnValue(defaultHookValue);
  });

  it("renders dashboard title", () => {
    render(<HealthDashboard />);

    expect(
      screen.getByText("Platform Health")
    ).toBeInTheDocument();
  });

  it("shows loading indicator when loading and no data", () => {
    vi.mocked(useHealth).mockReturnValue({
      ...defaultHookValue,
      loading: true,
      data: [],
    });

    render(<HealthDashboard />);

    expect(
      screen.getByTestId("loading-indicator")
    ).toBeInTheDocument();
  });

  it("shows error message", () => {
    vi.mocked(useHealth).mockReturnValue({
      ...defaultHookValue,
      error: "Failed to fetch system health.",
    });

    render(<HealthDashboard />);

    expect(
      screen.getByTestId("dashboard-error")
    ).toHaveTextContent("Failed to fetch system health.");
  });

  it("shows empty state when no data available", () => {
    vi.mocked(useHealth).mockReturnValue({
      ...defaultHookValue,
      data: [],
    });

    render(<HealthDashboard />);

    expect(
      screen.getByTestId("empty-state")
    ).toHaveTextContent("No data found");
  });

  it("renders health components when data exists", () => {
    render(<HealthDashboard />);

    expect(
      screen.getByTestId("health-card")
    ).toHaveTextContent("MySQL");

    expect(
      screen.getByTestId("health-chart")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("version-card")
    ).toBeInTheDocument();
  });

  it("toggles auto refresh", async () => {
    const user = userEvent.setup();

    const setAutoRefresh = vi.fn();

    vi.mocked(useHealth).mockReturnValue({
      ...defaultHookValue,
      autoRefresh: true,
      setAutoRefresh,
    });

    render(<HealthDashboard />);

    const toggle = screen.getByRole("switch", {
      name: /auto refresh/i,
    });

    await user.click(toggle);

    expect(setAutoRefresh).toHaveBeenCalledWith(false);
  });

  it("refresh button calls refresh function", async () => {
    const user = userEvent.setup();

    const refresh = vi.fn();

    vi.mocked(useHealth).mockReturnValue({
      ...defaultHookValue,
      refresh,
    });

    render(<HealthDashboard />);

    await user.click(
      screen.getByTestId("manual-refresh-button")
    );

    expect(refresh).toHaveBeenCalled();
  });

  it("logout clears session and navigates to login", async () => {
    const user = userEvent.setup();

    render(<HealthDashboard />);

    await user.click(
      screen.getByTestId("logout-button")
    );

    expect(logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
  });
});