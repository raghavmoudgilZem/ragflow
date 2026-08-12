import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { LoginPage, ProtectedRoute } from "@modules/identity";
import { ROUTES } from "@modules/identity/constants/routes";
import PageLoader from "@shared/components/common/PageLoader";
import { AgentPage, ChatsPage, DatasetPage, DatasetDetailPage } from "./lazyRoutes";
import { withRouteProtection } from "@modules/identity/utils/routeProtection";
import { useAuthSessionGuard } from "./useAuthSessionGuard";
import { useDeepLinkAuth } from "@modules/identity/hooks/useDeepLinkAuth";
import { AppLayout } from "@shared/layouts/AppLayout";
import { ErrorFallback } from "./ErrorFallback";
import SearchAppsLandingPage from "@modules/search/pages/SearchAppsLandingPage";
import { AdminRouter } from "@modules/admin/routes/AdminRoutes";
import ChatDetailsPage from "@modules/chats/pages/ChatDetailsPage";
import SearchExecutionPage from "@modules/search/pages/SearchExecutionPage";
import { useAuthStore } from "@modules/identity/store/useAuthStore";
import { ChunkListPage } from "@modules/chunk";
import { TeamSettingsPage } from "@modules/identity/pages/TeamSettingPage";
import { ProfileSettingPage } from "@modules/identity/pages/ProfileSettingPage";

function RouteErrorFallback() {
  const error = useRouteError();

  function getErrorMessage(error: unknown): string {
    if (isRouteErrorResponse(error)) {
      return error.statusText;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unhandled exception occurred.";
  }
  const message = getErrorMessage(error);
  return <ErrorFallback title="Runtime Error" message={message} />;
}
const HomePage = lazy(() =>
  import("@modules/home/pages/HomePage").then((m) => ({ default: m.HomePage })),
);

const RootLayout = () => {
  useAuthSessionGuard();
  const { oauthError, closeOauthError } = useDeepLinkAuth();

  return (
    <>
      <Outlet />
      <Snackbar
        open={oauthError?.open || false}
        autoHideDuration={5000}
        onClose={closeOauthError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeOauthError}
          severity="warning"
          variant="filled"
          sx={{ width: "100%", borderRadius: "0.375rem" }}
        >
          {oauthError?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const DashboardPlaceholder = () => {
  const logoutAction = useAuthStore((state) => state.logoutAction);

  const handleLogoutSequence = () => {
    logoutAction();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "var(--bg)",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: "800", color: "var(--text-h)", mb: 1 }}
      >
        RAGFlow Re-architecture
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "var(--text)", mb: 4 }}>
        Development in progress
      </Typography>
      <Button
        variant="outlined"
        onClick={handleLogoutSequence}
        sx={{
          color: "var(--text)",
          borderColor: "var(--border)",
          textTransform: "none",
          "&:hover": { borderColor: "var(--text-h)", color: "var(--text-h)" },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: withRouteProtection(ROUTES.LOGIN, <LoginPage />),
      },

      {
        path: ROUTES.ROOT,
        element: withRouteProtection(ROUTES.ROOT, <DashboardPlaceholder />),
      },
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ROUTES.DATASETS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DatasetPage />
              </Suspense>
            ),
          },
          {
            path: `${ROUTES.DATASET}/:id`,
            element: withRouteProtection(
              ROUTES.DATASET,
              <Suspense fallback={<PageLoader />}>
                <DatasetDetailPage />
              </Suspense>,
            ),
          },
          {
            path: ROUTES.CHUNK_PARSED_CHUNKS,
            element: withRouteProtection(
              ROUTES.CHUNK_PARSED_CHUNKS,
              <ChunkListPage />,
            ),
          },
          {
            path: ROUTES.AGENTS,
            element: withRouteProtection(ROUTES.AGENTS, <AgentPage />),
          },
          {
            path: ROUTES.CHATS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ChatsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CHAT_DETAIL,
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ChatDetailsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },

          {
            path: ROUTES.SEARCHES,
            element: withRouteProtection(ROUTES.SEARCHES, <SearchAppsLandingPage />),
          },
          {
            path: ROUTES.SEARCH_BY_ID,
            element: withRouteProtection(ROUTES.SEARCHES, <SearchExecutionPage />),
          },
          {
            path: ROUTES.FILES,
            element: withRouteProtection(ROUTES.FILES, <>FilesPage</>),
          },
          {
            path: ROUTES.PROFILE,
            element: withRouteProtection(ROUTES.PROFILE, <>ProfilePage</>),
          },
          {
            path: ROUTES.ADMIN,
            element: withRouteProtection(ROUTES.ADMIN, <>AdminPage</>),
          },
          {
            path: ROUTES.USER_SETTING_TEAM,
            element: withRouteProtection(ROUTES.PROFILE, <TeamSettingsPage />)
          },
          {
            path: ROUTES.USER_SETTING_PROFILE,
            element: withRouteProtection(ROUTES.PROFILE, <ProfileSettingPage />)
          },
        ]
      },
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ROUTES.HOME,
            element: (
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={ROUTES.ROOT} replace />,
      },
    ],
  },  ...AdminRouter,
]);

export const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <RouterProvider router={router} />
  </Suspense>
);