import { beforeEach, describe, expect, it, vi } from "vitest";
import axios, { type AxiosInstance } from "axios";

vi.mock("axios");

describe("admin-service", () => {
  let mockClient: Partial<AxiosInstance>;

  beforeEach(async () => {
    localStorage.clear();

    mockClient = {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn(),
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn(),
        },
      },
    };

    vi.mocked(axios.create).mockReturnValue(
      mockClient as AxiosInstance
    );

    vi.resetModules();
  });

  it("stores and retrieves admin token", async () => {
    const { setAdminToken, getAdminToken } = await import("./admin-service");

    setAdminToken("test-token");

    expect(getAdminToken()).toBe("test-token");
  });

  it("clears admin session", async () => {
    const { clearAdminSession } = await import("./admin-service");

    localStorage.setItem("admin_access_token", "abc");
    localStorage.setItem("admin_refresh_token", "xyz");

    clearAdminSession();

    expect(localStorage.getItem("admin_access_token")).toBeNull();
    expect(localStorage.getItem("admin_refresh_token")).toBeNull();
  });

  it("logs in successfully", async () => {
    const response = {
      data: {
        success: true,
        errors: [],
        data: {
          id: "1",
          email: "admin@test.com",
          name: "Admin",
          roles: ["ADMIN"],
          access_token: "access-token",
          refresh_token: "refresh-token",
          expiresIn: 3600,
        },
      },
    };

    vi.mocked(mockClient.post!).mockResolvedValue(response);

    const { adminLogin } = await import("./admin-service");

    const result = await adminLogin({
      email: "admin@test.com",
      password: "password",
    });

    expect(mockClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "admin@test.com",
      password: "password",
    });

    expect(result).toEqual(response.data);

    expect(localStorage.getItem("admin_access_token")).toBe(
      "access-token"
    );

    expect(localStorage.getItem("admin_refresh_token")).toBe(
      "refresh-token"
    );
  });

});