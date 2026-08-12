import { describe, it, expect } from "vitest";
import { AdminRouter } from "../AdminRoutes";
import AdminProtectedRoute from "../AdminProtectedRoute";

describe("AdminRouter", () => {
  it("has admin login route", () => {
    const admin = AdminRouter.find((x) => x.path === "/admin");

    expect(admin).toBeDefined();

    const loginRoute = admin?.children?.find(
      (route) => route.path === "login"
    );

    expect(loginRoute).toBeDefined();
    expect(loginRoute?.path).toBe("login");
  });

  it("has protected dashboard route", () => {
    const admin = AdminRouter.find((x) => x.path === "/admin");

    expect(admin).toBeDefined();

    const protectedRoute = admin?.children?.find(
      (route) => route.element?.type === AdminProtectedRoute
    );

    expect(protectedRoute).toBeDefined();

    expect(protectedRoute?.children?.[0].path).toBe("dashboard");
  });
});
