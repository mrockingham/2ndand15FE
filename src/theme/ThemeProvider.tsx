import { useEffect, useMemo, type PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

import { useThemePreferences } from '@/stores/themePreferences';
import { createAppTheme } from '@/theme/createAppTheme';

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemePreferences((state) => state.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    document.documentElement.dataset.colorScheme = mode;

    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    themeColor?.setAttribute('content', theme.appSurfaces.canvas);
  }, [mode, theme.appSurfaces.canvas]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};
