import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { useThemePreferences } from '@/stores/themePreferences';
import { useAuthStore } from '@/stores/authStore';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    accessTokenExpiresAt: null,
    restorationStatus: 'pending',
  });
  useThemePreferences.setState({ mode: 'dark' });
  vi.restoreAllMocks();
});
