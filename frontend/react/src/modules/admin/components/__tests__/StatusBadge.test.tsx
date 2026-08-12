import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders Online label for Healthy status", () => {
    render(<StatusBadge status="Healthy" />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("Online");
  });

  it("renders Offline label for Degraded status", () => {
    render(<StatusBadge status="Degraded" />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("Offline");
  });
});
