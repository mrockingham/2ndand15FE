import { useMemo, type CSSProperties, type PropsWithChildren } from 'react';
import { useTheme } from '@mui/material/styles';

import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import {
  TeamVisualThemeContext,
  type TeamVisualThemeContextValue,
} from '@/features/teamVisualIdentity/teamVisualContext';
import {
  getTeamThemeTokens,
  getTeamVisualCssVariables,
} from '@/features/teamVisualIdentity/teamTheme';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

export const TeamVisualThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const user = useCurrentUserQuery().data;
  const isAuthenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );
  const config = isAuthenticated
    ? getTeamVisualConfig(user?.favoriteTeam?.abbreviation)
    : null;
  const tokens = useMemo(
    () => getTeamThemeTokens(config, theme.palette.mode),
    [config, theme.palette.mode],
  );
  const value = useMemo<TeamVisualThemeContextValue>(
    () => ({
      team: config?.abbreviation ?? null,
      isTeamPersonalized: config !== null,
      tokens,
    }),
    [config, tokens],
  );
  const style = useMemo(
    () =>
      ({
        ...getTeamVisualCssVariables(tokens),
        minHeight: '100vh',
      }) as CSSProperties,
    [tokens],
  );

  return (
    <TeamVisualThemeContext.Provider value={value}>
      <div
        data-testid="team-visual-theme-root"
        data-team-visual={config?.abbreviation ?? 'DEFAULT'}
        data-team-personalized={config !== null ? 'true' : 'false'}
        style={style}
      >
        {children}
      </div>
    </TeamVisualThemeContext.Provider>
  );
};
