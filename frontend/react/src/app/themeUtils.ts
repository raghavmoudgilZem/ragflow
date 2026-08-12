export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "ragflow_theme_mode";

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark";

export function getStoredThemeMode(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

export function resolveThemeMode(preferred?: ThemeMode): ThemeMode {
  if (isThemeMode(preferred)) return preferred;

  const stored = getStoredThemeMode();
  if (stored) return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemeToDocument(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}