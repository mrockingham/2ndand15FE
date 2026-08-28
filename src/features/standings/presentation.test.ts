import {
  formatPointDifferential,
  formatStandingsRecord,
  formatWinPercentage,
  standingsPageTitle,
} from '@/features/standings/presentation';

describe('standings presentation', () => {
  it('formats record splits while preserving missing values and ties', () => {
    expect(formatStandingsRecord(2, 0, 0)).toBe('2-0');
    expect(formatStandingsRecord(1, 0, 1)).toBe('1-0-1');
    expect(formatStandingsRecord(null, 0, 0)).toBe('—');
  });

  it('uses the backend percentage and explicit differential signs', () => {
    expect(formatWinPercentage(1)).toBe('1.000');
    expect(formatWinPercentage(0.75)).toBe('.750');
    expect(formatWinPercentage(0)).toBe('.000');
    expect(formatWinPercentage(null)).toBe('—');
    expect(formatPointDifferential(40)).toBe('+40');
    expect(formatPointDifferential(-21)).toBe('-21');
    expect(formatPointDifferential(0)).toBe('0');
  });

  it('labels preseason distinctly without changing the regular-season title', () => {
    expect(standingsPageTitle(2026, 'PRE')).toBe(
      'NFL Preseason Standings 2026',
    );
    expect(standingsPageTitle(2025, 'REG')).toBe('NFL Standings 2025');
  });
});
