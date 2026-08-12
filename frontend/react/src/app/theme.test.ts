// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getStoredThemeMode,
  resolveThemeMode,
  applyThemeToDocument,
} from "./themeUtils";

const createLocalStorageStub = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      store.set(key, value);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
    clear: (): void => {
      store.clear();
    },
  };
};

describe("theme util", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageStub());

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    document.documentElement.dataset.theme = "";
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns stored theme mode", () => {
    localStorage.setItem("ragflow_theme_mode", "dark");

    expect(getStoredThemeMode()).toBe("dark");
  });

  it("returns null for invalid stored theme", () => {
    localStorage.setItem("ragflow_theme_mode", "blue");

    expect(getStoredThemeMode()).toBeNull();
  });

  it("returns preferred theme when provided", () => {
    expect(resolveThemeMode("light")).toBe("light");
  });

  it("returns stored theme when preferred theme is not provided", () => {
    localStorage.setItem("ragflow_theme_mode", "dark");

    expect(resolveThemeMode()).toBe("dark");
  });

  it("falls back to system theme", () => {
    expect(resolveThemeMode()).toBe("light");
  });

  it("applies theme to document", () => {
    applyThemeToDocument("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});