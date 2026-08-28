import {
  normalizeStandingsUrlState,
  serializeStandingsUrlState,
  updateStandingsUrlState,
} from '@/features/standings/urlState';

describe('standings URL state', () => {
  it('defaults to the available 2026 preseason division view', () => {
    expect(normalizeStandingsUrlState(new URLSearchParams())).toEqual({
      season: 2026,
      seasonType: 'PRE',
      view: 'division',
    });
  });

  it('accepts the supported 2025 regular-season deep link', () => {
    const state = normalizeStandingsUrlState(
      new URLSearchParams('season=2025&seasonType=REG&view=conference'),
    );
    expect(state).toEqual({
      season: 2025,
      seasonType: 'REG',
      view: 'conference',
    });
    expect(serializeStandingsUrlState(state).toString()).toBe(
      'season=2025&seasonType=REG&view=conference',
    );
  });

  it('normalizes invalid and unsupported parameters safely', () => {
    expect(
      normalizeStandingsUrlState(
        new URLSearchParams('season=1999&seasonType=POST&view=bad'),
      ),
    ).toEqual({ season: 2026, seasonType: 'PRE', view: 'division' });
    expect(
      updateStandingsUrlState(
        { season: 2026, seasonType: 'PRE', view: 'league' },
        { season: 2025 },
      ),
    ).toEqual({ season: 2025, seasonType: 'REG', view: 'league' });
  });
});
