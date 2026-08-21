export type HelmetStripeStyle =
  'none' | 'single-center' | 'double-center' | 'side-accent';

export type HelmetAbbreviationPlacement = 'helmet-side' | 'below-helmet';

export interface TeamVisualConfig {
  readonly teamName: string;
  readonly abbreviation: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly helmetShellColor: string;
  readonly helmetFacemaskColor: string;
  readonly helmetStripeStyle: HelmetStripeStyle;
  readonly helmetAbbreviationPlacement: HelmetAbbreviationPlacement;
  readonly helmetTextColor: string;
}

export interface TeamThemeTokens {
  readonly primary: string;
  readonly secondary: string;
  readonly onPrimary: string;
  readonly onSecondary: string;
  readonly accent: string;
  readonly subtleBackground: string;
  readonly subtleBackgroundStrong: string;
  readonly subtleBorder: string;
  readonly focusRing: string;
  readonly heroStart: string;
  readonly heroEnd: string;
  readonly selectedBackground: string;
  readonly selectedText: string;
}
