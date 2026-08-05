import {
  formatStatValue,
  safeAverage,
  safeHeadshotUrl,
  safePercentage,
} from '@/features/players/presentation';
import {
  visibleGameMetrics,
  visibleSeasonGroups,
} from '@/features/players/metrics';
import {
  quarterbackGameFixture,
  quarterbackSeasonFixture,
} from '@/test/playerFixtures';

describe('player statistics presentation', () => {
  it('keeps missing values distinct from recorded zeroes', () => {
    expect(formatStatValue(null)).toBe('\u2014');
    expect(formatStatValue(0)).toBe('0');
    expect(safePercentage(0, 0)).toBeNull();
    expect(safeAverage(10, null)).toBeNull();
  });

  it('shows only position-relevant stat groups and columns', () => {
    expect(
      visibleSeasonGroups(quarterbackSeasonFixture).map((row) => row.key),
    ).toEqual(['passing', 'fantasy']);
    expect(
      visibleGameMetrics([quarterbackGameFixture]).map((row) => row.key),
    ).toEqual(['passCmp', 'passAtt', 'passYds', 'passTd']);
  });

  it('accepts only HTTP(S) headshots', () => {
    expect(safeHeadshotUrl('https://example.com/player.png')).toBe(
      'https://example.com/player.png',
    );
    expect(safeHeadshotUrl('javascript:alert(1)')).toBeNull();
    expect(safeHeadshotUrl(null)).toBeNull();
  });
});
