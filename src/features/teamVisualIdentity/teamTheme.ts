import {
  alpha,
  getContrastRatio,
  type PaletteMode,
} from '@mui/material/styles';

import type {
  TeamThemeTokens,
  TeamVisualConfig,
} from '@/features/teamVisualIdentity/teamVisualTypes';

export const DEFAULT_APP_VISUAL_COLORS = {
  primary: '#5B37EE',
  primaryDark: '#8064FF',
  secondary: '#2AD4FF',
  secondaryLight: '#007FA8',
  accent: '#A692FF',
} as const;

const readableText = (background: string) =>
  getContrastRatio(background, '#FFFFFF') >=
  getContrastRatio(background, '#111827')
    ? '#FFFFFF'
    : '#111827';

const createTokens = (
  primary: string,
  secondary: string,
  accent: string,
  mode: PaletteMode,
): TeamThemeTokens => {
  const isDark = mode === 'dark';
  const onPrimary = readableText(primary);
  const onSecondary = readableText(secondary);

  return {
    primary,
    secondary,
    onPrimary,
    onSecondary,
    accent,
    subtleBackground: alpha(primary, isDark ? 0.16 : 0.08),
    subtleBackgroundStrong: alpha(primary, isDark ? 0.28 : 0.14),
    subtleBorder: alpha(
      getContrastRatio(primary, isDark ? '#0B111E' : '#FFFFFF') >= 2.5
        ? primary
        : secondary,
      isDark ? 0.78 : 0.58,
    ),
    focusRing: alpha(
      getContrastRatio(secondary, isDark ? '#050914' : '#FFFFFF') >= 3
        ? secondary
        : primary,
      0.72,
    ),
    heroStart: alpha(primary, isDark ? 0.34 : 0.18),
    heroEnd: alpha(secondary, isDark ? 0.12 : 0.08),
    selectedBackground: primary,
    selectedText: onPrimary,
  };
};

const tokenCache = new Map<string, TeamThemeTokens>();

export const getTeamThemeTokens = (
  config: TeamVisualConfig | null,
  mode: PaletteMode,
): TeamThemeTokens => {
  const cacheKey = `${config?.abbreviation ?? 'DEFAULT'}:${mode}`;
  const cached = tokenCache.get(cacheKey);
  if (cached) return cached;

  const tokens = config
    ? createTokens(
        config.primaryColor,
        config.secondaryColor,
        config.accentColor,
        mode,
      )
    : createTokens(
        mode === 'dark'
          ? DEFAULT_APP_VISUAL_COLORS.primaryDark
          : DEFAULT_APP_VISUAL_COLORS.primary,
        mode === 'dark'
          ? DEFAULT_APP_VISUAL_COLORS.secondary
          : DEFAULT_APP_VISUAL_COLORS.secondaryLight,
        DEFAULT_APP_VISUAL_COLORS.accent,
        mode,
      );

  tokenCache.set(cacheKey, tokens);
  return tokens;
};

export const getTeamVisualCssVariables = (
  tokens: TeamThemeTokens,
): Record<`--team-${string}`, string> => ({
  '--team-primary': tokens.primary,
  '--team-secondary': tokens.secondary,
  '--team-on-primary': tokens.onPrimary,
  '--team-on-secondary': tokens.onSecondary,
  '--team-accent': tokens.accent,
  '--team-subtle': tokens.subtleBackground,
  '--team-subtle-strong': tokens.subtleBackgroundStrong,
  '--team-border': tokens.subtleBorder,
  '--team-focus': tokens.focusRing,
  '--team-hero-start': tokens.heroStart,
  '--team-hero-end': tokens.heroEnd,
  '--team-selected-bg': tokens.selectedBackground,
  '--team-selected-text': tokens.selectedText,
});
