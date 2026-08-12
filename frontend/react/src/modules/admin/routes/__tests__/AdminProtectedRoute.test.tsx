import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AdminProtectedRoute from "../AdminProtectedRoute";

const Protected = () => <div>Secret Dashboard</div>;

const LoginStub = () => <div>Login Page</div>;
const token = [
  btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour
    }),
  ),
  "signature",
].join(".");
const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <Routes>
        <Route path="/admin/login" element={<LoginStub />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<Protected />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AdminProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects to login when admin token is missing", () => {
    renderWithRouter();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content when admin token exists", () => {
    localStorage.setItem(
      "admin_access_token",
      token,
    );

    renderWithRouter();

    expect(screen.getByText("Secret Dashboard")).toBeInTheDocument();
  });
});
