import {
  normalizeStatsUrlState,
  serializeStatsUrlState,
} from '@/features/statsHub/urlState';
import { statsMetadataFixture } from '@/test/statsHubFixtures';
import {
  readCurrentStatsFilters,
  resolveStatsMode,
  serializeCurrentStatsState,
} from './currentUrlState';

describe('Stats Hub URL state', () => {
  it('defaults new Stats visits to current while preserving legacy Historical URLs', () => {
    expect(resolveStatsMode(new URLSearchParams())).toBe('current');
    expect(resolveStatsMode(new URLSearchParams('season=2025'))).toBe(
      'historical',
    );
    expect(resolveStatsMode(new URLSearchParams('view=week&type=REG'))).toBe(
      'historical',
    );
    expect(
      resolveStatsMode(new URLSearchParams('mode=current&season=2026')),
    ).toBe('current');
  });

  it('round-trips current-season state without accepting invalid team identity', () => {
    const serialized = serializeCurrentStatsState(
      { season: 2026, seasonType: 'PRE', week: 2 },
      '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
    );
    expect(readCurrentStatsFilters(serialized)).toEqual({
      season: 2026,
      seasonType: 'PRE',
      week: 2,
      teamId: '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
    });
    expect(
      readCurrentStatsFilters(new URLSearchParams('teamId=provider-12')).teamId,
    ).toBeUndefined();
  });

  it('derives stable defaults from metadata rather than fixed application values', () => {
    const state = normalizeStatsUrlState(
      new URLSearchParams(),
      statsMetadataFixture,
    );
    expect(state).toMatchObject({
      view: 'season',
      season: 2025,
      seasonType: 'REG',
      category: 'PASSING',
      metric: 'passing_yards',
      recentGames: 5,
    });
  });

  it('normalizes stale values and removes weekly-only state in season view', () => {
    const state = normalizeStatsUrlState(
      new URLSearchParams(
        'view=nope&season=2030&type=BAD&week=99&category=BAD&metric=bad&position=rb&positionGroup=offense&recentGames=99',
      ),
      statsMetadataFixture,
    );
    expect(state).toMatchObject({
      view: 'season',
      season: 2025,
      seasonType: 'REG',
      category: 'PASSING',
      metric: 'passing_yards',
      position: undefined,
      positionGroup: undefined,
      week: undefined,
      recentGames: 5,
    });
  });

  it('rejects REG_POST in weekly state and preserves valid shareable filters', () => {
    const state = normalizeStatsUrlState(
      new URLSearchParams(
        'view=week&season=2024&type=REG_POST&week=10&category=DEFENSE&metric=sacks&position=de&positionGroup=dl&teamId=8ef55f16-d6f7-4da4-9f4b-0a8e3461b786&recentType=POST&recentGames=20',
      ),
      statsMetadataFixture,
    )!;
    expect(state).toMatchObject({
      view: 'week',
      season: 2024,
      seasonType: 'REG',
      week: 10,
      category: 'DEFENSE',
      metric: 'sacks',
      position: 'DE',
      positionGroup: 'DL',
      teamId: '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
      recentSeasonType: 'POST',
      recentGames: 20,
    });
    expect(serializeStatsUrlState(state).get('cursor')).toBeNull();
  });
});
