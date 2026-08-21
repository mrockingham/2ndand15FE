import {
  normalizeAiHubUrlState,
  serializeAiHubUrlState,
  weekLimitFor,
} from '@/features/aiHub/urlState';

describe('AI Hub URL state', () => {
  it('normalizes invalid values to the current hosted context', () => {
    expect(
      normalizeAiHubUrlState(
        new URLSearchParams('season=nope&type=INVALID&week=99'),
      ),
    ).toEqual({ season: 2026, seasonType: 'PRE', week: 1 });
  });

  it('preserves a valid future selectable week in a shareable URL', () => {
    const state = normalizeAiHubUrlState(
      new URLSearchParams('season=2027&type=REG&week=12'),
    );
    expect(state).toEqual({ season: 2027, seasonType: 'REG', week: 12 });
    expect(serializeAiHubUrlState(state).toString()).toBe(
      'season=2027&type=REG&week=12',
    );
  });

  it('keeps week ranges explicit per season type', () => {
    expect(weekLimitFor('PRE')).toBe(5);
    expect(weekLimitFor('REG')).toBe(18);
    expect(weekLimitFor('POST')).toBe(5);
  });
});
