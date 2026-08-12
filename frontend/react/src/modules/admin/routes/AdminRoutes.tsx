/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import PageLoader from "@shared/components/common/PageLoader";
import AdminProtectedRoute from "./AdminProtectedRoute";
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const HealthDashboard = lazy(() => import("../pages/HealthDashboard"));
export const AdminRouter = [
  {
    path: "/admin",
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        ),
      },
      {
        element: <AdminProtectedRoute />, // Protect all routes below
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HealthDashboard />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];