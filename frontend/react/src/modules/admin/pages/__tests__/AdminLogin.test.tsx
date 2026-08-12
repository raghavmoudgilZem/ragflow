import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminLogin from "../AdminLogin";
import { adminLogin } from "../../api/admin-service";

const mockNavigate = vi.fn();

vi.mock("../../api/admin-service", () => ({
  adminLogin: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AdminLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form", () => {
    render(<AdminLogin />);

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit")).toBeInTheDocument();
  });

  it("logs in successfully and navigates", async () => {
    const user = userEvent.setup();

    vi.mocked(adminLogin).mockResolvedValue({
      success: true,
      errors: [],
      data: {} as never,
    });

    render(<AdminLogin />);

    const username = screen.getByTestId("username-input");
    const password = screen.getByTestId("password-input");

    await user.clear(username);
    await user.type(username, "admin@test.com");

    await user.clear(password);
    await user.type(password, "Password@123");

    await user.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(adminLogin).toHaveBeenCalledWith({
        email: "admin@test.com",
        password: "Password@123",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows backend error message when login fails", async () => {
    const user = userEvent.setup();

    vi.mocked(adminLogin).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    render(<AdminLogin />);

    await user.click(screen.getByTestId("login-submit"));

    expect(await screen.findByTestId("login-error")).toBeInTheDocument();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows default error for unknown rejection", async () => {
    const user = userEvent.setup();

    vi.mocked(adminLogin).mockRejectedValueOnce("Unknown");

    render(<AdminLogin />);

    await user.click(screen.getByTestId("login-submit"));

    expect(await screen.findByTestId("login-error")).toHaveTextContent(
      "Login failed. Please try again."
    );
  });
});