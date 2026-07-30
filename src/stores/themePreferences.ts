import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = '2nd-and-15-theme';

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'dark' || value === 'light';

const readStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
};

const readSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const getInitialThemeMode = (): ThemeMode =>
  readStoredTheme() ?? readSystemTheme();

const persistTheme = (mode: ThemeMode) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Theme switching still works when storage is unavailable.
  }
};

interface ThemePreferencesState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemePreferences = create<ThemePreferencesState>(
  (set, get) => ({
    mode: getInitialThemeMode(),
    setMode: (mode) => {
      persistTheme(mode);
      set({ mode });
    },
    toggleMode: () => {
      const nextMode = get().mode === 'dark' ? 'light' : 'dark';
      persistTheme(nextMode);
      set({ mode: nextMode });
    },
  }),
);
