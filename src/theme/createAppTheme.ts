import { alpha, createTheme, type PaletteMode } from '@mui/material/styles';

import type { AppSurfaceTokens } from '@/theme/theme.types';

const darkSurfaces: AppSurfaceTokens = {
  canvas: '#050914',
  canvasAccent: '#0A1021',
  elevated: '#0E1424',
  panel: '#0B111E',
  panelStrong: '#121A2B',
  border: 'rgba(157, 174, 211, 0.16)',
  borderStrong: 'rgba(157, 174, 211, 0.28)',
  muted: '#8F9AB2',
  accentSecondary: '#2AD4FF',
  header: 'rgba(5, 9, 20, 0.86)',
  navSelected: 'rgba(112, 73, 255, 0.16)',
  field: '#0C352E',
};

const lightSurfaces: AppSurfaceTokens = {
  canvas: '#F5F7FB',
  canvasAccent: '#EEF2F9',
  elevated: '#FFFFFF',
  panel: '#FFFFFF',
  panelStrong: '#F8FAFD',
  border: 'rgba(21, 32, 59, 0.11)',
  borderStrong: 'rgba(21, 32, 59, 0.2)',
  muted: '#667085',
  accentSecondary: '#007FA8',
  header: 'rgba(255, 255, 255, 0.88)',
  navSelected: 'rgba(91, 55, 238, 0.1)',
  field: '#DDEDE7',
};

export const createAppTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';
  const appSurfaces = isDark ? darkSurfaces : lightSurfaces;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#8064FF' : '#5B37EE',
        light: '#A692FF',
        dark: '#4221BC',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: appSurfaces.accentSecondary,
      },
      success: {
        main: isDark ? '#42D39B' : '#087A55',
      },
      warning: {
        main: isDark ? '#F9B44E' : '#A85A00',
      },
      error: {
        main: isDark ? '#FF6577' : '#C52A3C',
      },
      background: {
        default: appSurfaces.canvas,
        paper: appSurfaces.panel,
      },
      text: {
        primary: isDark ? '#F7F9FD' : '#111827',
        secondary: appSurfaces.muted,
      },
      divider: appSurfaces.border,
    },
    appSurfaces,
    shape: {
      borderRadius: 14,
    },
    spacing: 8,
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontSize: 'clamp(3.25rem, 8vw, 7.5rem)',
        fontWeight: 900,
        letterSpacing: '-0.065em',
        lineHeight: 0.88,
      },
      h2: {
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontWeight: 850,
        letterSpacing: '-0.045em',
        lineHeight: 0.98,
      },
      h3: {
        fontSize: 'clamp(1.35rem, 2.2vw, 2rem)',
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 750,
        letterSpacing: '-0.015em',
      },
      button: {
        fontWeight: 750,
        letterSpacing: '-0.01em',
        textTransform: 'none',
      },
      overline: {
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.12em',
        lineHeight: 1.5,
      },
    },
    transitions: {
      duration: {
        shortest: 120,
        shorter: 160,
        short: 200,
        standard: 240,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            minWidth: 320,
            backgroundColor: appSurfaces.canvas,
            scrollBehavior: 'smooth',
          },
          body: {
            minWidth: 320,
            minHeight: '100vh',
            margin: 0,
            backgroundColor: appSurfaces.canvas,
            backgroundImage: isDark
              ? 'radial-gradient(circle at 78% -10%, rgba(93, 58, 238, 0.15), transparent 34%)'
              : 'radial-gradient(circle at 78% -10%, rgba(91, 55, 238, 0.08), transparent 32%)',
          },
          '#root': {
            minHeight: '100vh',
          },
          '::selection': {
            color: '#FFFFFF',
            backgroundColor: '#5B37EE',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              scrollBehavior: 'auto !important',
              transitionDuration: '0.01ms !important',
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            color: isDark ? '#F7F9FD' : '#111827',
            backgroundColor: appSurfaces.header,
            backgroundImage: 'none',
            borderBottom: `1px solid ${appSurfaces.border}`,
            boxShadow: 'none',
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 10,
            paddingInline: 18,
            transition: 'transform 160ms ease, background-color 160ms ease',
            '&:focus-visible': {
              outline: `3px solid ${alpha(appSurfaces.accentSecondary, 0.5)}`,
              outlineOffset: 2,
            },
          },
          contained: {
            backgroundImage: 'linear-gradient(115deg, #5122E9, #7654FF)',
            '&:hover': {
              backgroundImage: 'linear-gradient(115deg, #4520C7, #6948F2)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: appSurfaces.borderStrong,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:focus-visible': {
              outline: `3px solid ${alpha(appSurfaces.accentSecondary, 0.5)}`,
              outlineOffset: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${appSurfaces.border}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0, 0, 0, 0.22)'
              : '0 18px 50px rgba(30, 45, 80, 0.07)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: appSurfaces.elevated,
          },
          notchedOutline: {
            borderColor: appSurfaces.borderStrong,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 72,
            backgroundColor: appSurfaces.header,
            borderTop: `1px solid ${appSurfaces.border}`,
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 56,
            color: appSurfaces.muted,
            '&.Mui-selected': {
              color: isDark ? '#A78BFA' : '#5B37EE',
            },
            '&:focus-visible': {
              outline: `3px solid ${alpha(appSurfaces.accentSecondary, 0.45)}`,
              outlineOffset: -4,
            },
          },
          label: {
            fontSize: '0.68rem',
            fontWeight: 700,
            '&.Mui-selected': {
              fontSize: '0.68rem',
            },
          },
        },
      },
    },
  });
};
