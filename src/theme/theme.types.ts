export interface AppSurfaceTokens {
  canvas: string;
  canvasAccent: string;
  elevated: string;
  panel: string;
  panelStrong: string;
  border: string;
  borderStrong: string;
  muted: string;
  accentSecondary: string;
  header: string;
  navSelected: string;
  field: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    appSurfaces: AppSurfaceTokens;
  }

  interface ThemeOptions {
    appSurfaces?: AppSurfaceTokens;
  }
}
