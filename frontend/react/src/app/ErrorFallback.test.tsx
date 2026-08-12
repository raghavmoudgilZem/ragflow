import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorFallback } from "./ErrorFallback";

describe("ErrorFallback", () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the provided title and message", () => {
    render(
      <ErrorFallback
        title="Something went wrong"
        message="Please try again."
      />
    );

    expect(screen.getByText("Something went wrong")).not.toBeNull();
    expect(screen.getByText("Please try again.")).not.toBeNull();
  });

  it("does not render an action button when actionLabel and onAction are not provided", () => {
    render(<ErrorFallback title="Error" message="Something failed." />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the action button when actionLabel and onAction props are provided", () => {
    render(
      <ErrorFallback
        title="Error"
        message="Something failed."
        actionLabel="Retry"
        onAction={mockOnAction}
      />
    );

    const button = screen.getByRole("button", { name: /retry/i });
    expect(button).not.toBeNull();
  });

  it("calls the onAction callback when the action button is clicked", () => {
    render(
      <ErrorFallback
        title="Error"
        message="Something failed."
        actionLabel="Retry"
        onAction={mockOnAction}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("renders the custom icon when the icon prop is provided", () => {
    render(
      <ErrorFallback
        title="Error"
        message="Something failed."
        icon={<span data-testid="custom-icon">ICON</span>}
      />
    );

    expect(screen.getByTestId("custom-icon")).not.toBeNull();
  });

  it("does not render a custom icon when the icon prop is not provided", () => {
    render(<ErrorFallback title="Error" message="Something failed." />);

    expect(screen.queryByTestId("custom-icon")).toBeNull();
  });
});