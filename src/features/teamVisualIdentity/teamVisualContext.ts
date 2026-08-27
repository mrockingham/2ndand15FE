import { createContext, useContext } from 'react';

import type { TeamThemeTokens } from '@/features/teamVisualIdentity/teamVisualTypes';

export interface TeamVisualThemeContextValue {
  readonly team: string | null;
  readonly isTeamPersonalized: boolean;
  readonly tokens: TeamThemeTokens;
}

export const TeamVisualThemeContext =
  createContext<TeamVisualThemeContextValue | null>(null);

export const useTeamVisualTheme = () => {
  const context = useContext(TeamVisualThemeContext);
  if (!context) {
    throw new Error(
      'useTeamVisualTheme must be used within TeamVisualThemeProvider.',
    );
  }
  return context;
};
