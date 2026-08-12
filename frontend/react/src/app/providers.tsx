import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import i18n from "@shared/i18n";
import type { ThemeMode } from "./themeUtils";
import { applyThemeToDocument, resolveThemeMode } from "./themeUtils";
import { ProvidersShell } from "./ProvidersShell";

// Global QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Theme helper kept inline to avoid Fast Refresh ESLint restrictions.
function getThemeModeFromDocument(): ThemeMode {
  const v = document.documentElement.dataset.theme;
  if (v === "light" || v === "dark") return v;
  return resolveThemeMode();
}


export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  // Ensure document + MUI palette are synced as early as possible.
  // index.html bootstrap sets dataset.theme before any paint.
  const mode = getThemeModeFromDocument();
  applyThemeToDocument(mode);

  const ragflowTheme = createTheme({
    spacing: 8,
    palette: {
      mode,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ProvidersShell>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={ragflowTheme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </ProvidersShell>
  );
};


