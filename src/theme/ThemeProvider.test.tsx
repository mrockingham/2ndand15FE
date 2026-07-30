import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  getInitialThemeMode,
  THEME_STORAGE_KEY,
  useThemePreferences,
} from '@/stores/themePreferences';
import { renderApp } from '@/test/renderApp';

describe('theme preferences', () => {
  it('changes theme mode and persists the manual preference', async () => {
    useThemePreferences.setState({ mode: 'dark' });
    const user = userEvent.setup();
    renderApp('/');

    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    );

    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'light',
    );
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(getInitialThemeMode()).toBe('light');
  });
});
