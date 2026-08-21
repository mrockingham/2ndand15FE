import {
  compareGames,
  compareGamesForNext,
  formatGameDate,
  formatGameDateTime,
  formatGameTime,
  isGameUpcoming,
  TIME_TBD,
} from '@/features/games/utils/dateTime';
import {
  gameFixture,
  hallOfFameGameFixture,
  preseasonWeekOneFixture,
  tbdGameFixture,
} from '@/test/gameFixtures';

describe('game date and ordering utilities', () => {
  it('treats null and invalid kickoffs as Time TBD', () => {
    expect(formatGameDate(null)).toBe(TIME_TBD);
    expect(formatGameTime(null)).toBe(TIME_TBD);
    expect(formatGameDate('not-a-timestamp')).toBe(TIME_TBD);
    expect(formatGameTime('not-a-timestamp')).toBe(TIME_TBD);
    expect(formatGameDateTime(tbdGameFixture)).toBe('Week 16 · Time TBD');
  });

  it('uses Intl timezone conversion across daylight-saving time', () => {
    expect(
      formatGameTime('2026-03-08T07:30:00.000Z', {
        locale: 'en-US',
        timeZone: 'America/New_York',
      }),
    ).toContain('3:30 AM EDT');
    expect(
      formatGameTime('2026-11-01T06:30:00.000Z', {
        locale: 'en-US',
        timeZone: 'America/New_York',
      }),
    ).toContain('1:30 AM EST');
  });

  it('sorts known kickoffs before TBD and orders TBD matchups deterministically', () => {
    const laterTbd = {
      ...tbdGameFixture,
      id: '55555555-5555-4555-8555-555555555555',
      awayTeam: { ...tbdGameFixture.awayTeam, fullName: 'New York Jets' },
    };
    expect([laterTbd, tbdGameFixture, gameFixture].sort(compareGames)).toEqual([
      gameFixture,
      tbdGameFixture,
      laterTbd,
    ]);
  });

  it('keeps scheduled TBD games upcoming without selecting canceled games', () => {
    expect(isGameUpcoming(tbdGameFixture, new Date('2030-01-01'))).toBe(true);
    expect(isGameUpcoming({ ...tbdGameFixture, status: 'CANCELED' })).toBe(
      false,
    );
  });

  it('sorts the null-week special event before Preseason Week 1 by kickoff', () => {
    expect(
      [preseasonWeekOneFixture, hallOfFameGameFixture].sort(
        compareGamesForNext,
      ),
    ).toEqual([hallOfFameGameFixture, preseasonWeekOneFixture]);
  });
});
