import { getContrastRatio } from '@mui/material/styles';

import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import {
  DEFAULT_APP_VISUAL_COLORS,
  getTeamThemeTokens,
} from '@/features/teamVisualIdentity/teamTheme';

describe('team theme derivation', () => {
  it.each(['PHI', 'KC', 'DAL', 'LV', 'IND', 'MIA', 'PIT'])(
    'derives readable tokens for %s in both color modes',
    (abbreviation) => {
      const config = getTeamVisualConfig(abbreviation);
      expect(config).not.toBeNull();

      for (const mode of ['light', 'dark'] as const) {
        const tokens = getTeamThemeTokens(config, mode);
        expect(
          getContrastRatio(tokens.primary, tokens.onPrimary),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          getContrastRatio(tokens.secondary, tokens.onSecondary),
        ).toBeGreaterThanOrEqual(4.5);
        expect(tokens.subtleBackground).toContain('rgba');
        expect(tokens.selectedText).toBe(tokens.onPrimary);
      }
    },
  );

  it('preserves the existing purple branding as the default', () => {
    expect(getTeamThemeTokens(null, 'light').primary).toBe(
      DEFAULT_APP_VISUAL_COLORS.primary,
    );
    expect(getTeamThemeTokens(null, 'dark').primary).toBe(
      DEFAULT_APP_VISUAL_COLORS.primaryDark,
    );
  });

  it('memoizes token sets by team and mode', () => {
    const config = getTeamVisualConfig('PHI');
    expect(getTeamThemeTokens(config, 'dark')).toBe(
      getTeamThemeTokens(config, 'dark'),
    );
  });
});
