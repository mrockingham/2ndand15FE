import { teamVisualConfigs } from '@/features/teamVisualIdentity/teamVisualConfigs';

describe('teamVisualConfigs', () => {
  it('contains exactly the 32 supported teams with unique abbreviations', () => {
    const entries = Object.entries(teamVisualConfigs);
    const abbreviations = entries.map(([, config]) => config.abbreviation);

    expect(entries).toHaveLength(32);
    expect(new Set(abbreviations).size).toBe(32);
    expect(abbreviations).toEqual([
      'ARI',
      'ATL',
      'BAL',
      'BUF',
      'CAR',
      'CHI',
      'CIN',
      'CLE',
      'DAL',
      'DEN',
      'DET',
      'GB',
      'HOU',
      'IND',
      'JAX',
      'KC',
      'LV',
      'LAC',
      'LAR',
      'MIA',
      'MIN',
      'NE',
      'NO',
      'NYG',
      'NYJ',
      'PHI',
      'PIT',
      'SF',
      'SEA',
      'TB',
      'TEN',
      'WAS',
    ]);
  });

  it('uses valid reviewed colors and supported visual options', () => {
    const colorPattern = /^#[0-9A-F]{6}$/;
    const stripes = new Set([
      'none',
      'single-center',
      'double-center',
      'side-accent',
    ]);
    const placements = new Set(['helmet-side', 'below-helmet']);

    Object.values(teamVisualConfigs).forEach((config) => {
      expect(config.teamName).not.toBe('');
      expect(config.primaryColor).toMatch(colorPattern);
      expect(config.secondaryColor).toMatch(colorPattern);
      expect(config.accentColor).toMatch(colorPattern);
      expect(config.helmetShellColor).toMatch(colorPattern);
      expect(config.helmetFacemaskColor).toMatch(colorPattern);
      expect(config.helmetTextColor).toMatch(colorPattern);
      expect(stripes.has(config.helmetStripeStyle)).toBe(true);
      expect(placements.has(config.helmetAbbreviationPlacement)).toBe(true);
    });
  });

  it('places the Bengals and Browns abbreviations on the helmet shell', () => {
    expect(teamVisualConfigs.CIN.helmetAbbreviationPlacement).toBe(
      'helmet-side',
    );
    expect(teamVisualConfigs.CLE.helmetAbbreviationPlacement).toBe(
      'helmet-side',
    );
  });
});
