import {
  countNewPlaysSince,
  formatDownDistance,
  formatFreshnessAge,
  formatGameClock,
  formatYardLine,
  getGameDisplayLabel,
  getScoreboardStatusLine,
  isFinalizedGameStatus,
  isHallOfFameGame,
} from '@/features/games/presentation';
import { formatGameDateTime } from '@/features/games/utils/dateTime';
import {
  gameFixture,
  hallOfFameGameFixture,
  preseasonWeekOneFixture,
} from '@/test/gameFixtures';
import {
  scoringPlayFixture,
  turnoverPlayFixture,
} from '@/test/gamePlaysFixtures';

describe('public game labels', () => {
  it('recognizes only the reviewed Hall of Fame Game identity', () => {
    expect(isHallOfFameGame(hallOfFameGameFixture)).toBe(true);
    expect(getGameDisplayLabel(hallOfFameGameFixture)).toBe(
      'Hall of Fame Game',
    );
    expect(
      getGameDisplayLabel({
        ...hallOfFameGameFixture,
        id: '88888888-8888-4888-8888-888888888888',
      }),
    ).toBe('Preseason');
  });

  it('labels numbered weeks without inventing null or zero', () => {
    expect(getGameDisplayLabel(preseasonWeekOneFixture)).toBe(
      'Preseason Week 1',
    );
    expect(getGameDisplayLabel(gameFixture)).toBe('Regular Season Week 16');
    expect(getGameDisplayLabel(hallOfFameGameFixture)).not.toMatch(
      /Week (?:null|0)/,
    );
  });
});

describe('scoreboard status line', () => {
  it('shows a tight quarter-and-clock line while live', () => {
    expect(
      getScoreboardStatusLine({
        ...gameFixture,
        status: 'IN_PROGRESS',
        quarter: 2,
        clock: '04:31',
      }),
    ).toBe('Q2 · 04:31');
  });

  it('shows Halftime with no quarter/clock', () => {
    expect(
      getScoreboardStatusLine({ ...gameFixture, status: 'HALFTIME' }),
    ).toBe('Halftime');
  });

  it('shows kickoff timing for scheduled and pregame games', () => {
    expect(
      getScoreboardStatusLine({ ...gameFixture, status: 'SCHEDULED' }),
    ).toBe(formatGameDateTime(gameFixture));
    expect(
      getScoreboardStatusLine({
        ...gameFixture,
        status: 'PREGAME',
        startTime: null,
      }),
    ).toBe('Week 16 · Time TBD');
  });

  it('shows nothing extra once the game is final, since the status chip already says so', () => {
    expect(getScoreboardStatusLine({ ...gameFixture, status: 'FINAL' })).toBe(
      null,
    );
  });
});

describe('down/distance and yard-line formatting', () => {
  it('never fabricates down/distance when either value is missing', () => {
    expect(formatDownDistance(3, 7)).toBe('3rd & 7');
    expect(formatDownDistance(null, 7)).toBe(null);
    expect(formatDownDistance(3, null)).toBe(null);
    expect(formatDownDistance(1, 10)).toBe('1st & 10');
    expect(formatDownDistance(2, 5)).toBe('2nd & 5');
    expect(formatDownDistance(11, 1)).toBe('11th & 1');
  });

  it('labels offense-relative yard lines as OWN/50/OPP without guessing a team', () => {
    expect(formatYardLine(0)).toBe('Own 0');
    expect(formatYardLine(35)).toBe('Own 35');
    expect(formatYardLine(50)).toBe('50');
    expect(formatYardLine(53)).toBe('Opp 47');
    expect(formatYardLine(100)).toBe('Opp 0');
  });
});

describe('isFinalizedGameStatus', () => {
  it('treats FINAL/POSTPONED/CANCELED/SUSPENDED as finalized', () => {
    expect(isFinalizedGameStatus('FINAL')).toBe(true);
    expect(isFinalizedGameStatus('POSTPONED')).toBe(true);
    expect(isFinalizedGameStatus('CANCELED')).toBe(true);
    expect(isFinalizedGameStatus('SUSPENDED')).toBe(true);
    expect(isFinalizedGameStatus('SCHEDULED')).toBe(false);
    expect(isFinalizedGameStatus('IN_PROGRESS')).toBe(false);
  });
});

describe('formatGameClock', () => {
  it('passes an already-normalized M:SS clock through untouched', () => {
    expect(formatGameClock('14:17')).toBe('14:17');
    expect(formatGameClock('2:00')).toBe('2:00');
    expect(formatGameClock('0:00')).toBe('0:00');
  });

  it('converts a bare raw-seconds string instead of ever rendering it verbatim', () => {
    expect(formatGameClock('857')).toBe('14:17');
    expect(formatGameClock('666')).toBe('11:06');
    expect(formatGameClock('0')).toBe('0:00');
  });

  it('hides null/empty/garbage clocks rather than rendering something ugly', () => {
    expect(formatGameClock(null)).toBe(null);
    expect(formatGameClock('')).toBe(null);
    expect(formatGameClock('  ')).toBe(null);
    expect(formatGameClock('not-a-clock')).toBe(null);
  });
});

describe('formatFreshnessAge', () => {
  it('describes sub-second freshness as "just now"', () => {
    expect(formatFreshnessAge(0)).toBe('just now');
    expect(formatFreshnessAge(500)).toBe('just now');
  });

  it('describes seconds and minutes without raw timestamps', () => {
    expect(formatFreshnessAge(8_000)).toBe('8 sec ago');
    expect(formatFreshnessAge(59_000)).toBe('59 sec ago');
    expect(formatFreshnessAge(65_000)).toBe('1 min ago');
    expect(formatFreshnessAge(150_000)).toBe('3 min ago');
  });
});

describe('countNewPlaysSince', () => {
  const newestFirst = [
    { ...turnoverPlayFixture, sequence: 3 },
    { ...scoringPlayFixture, sequence: 2 },
    { ...scoringPlayFixture, sequence: 1 },
  ];

  it('counts only plays newer than the last-seen sequence', () => {
    expect(countNewPlaysSince(newestFirst, 1)).toBe(2);
    expect(countNewPlaysSince(newestFirst, 3)).toBe(0);
    expect(countNewPlaysSince(newestFirst, 0)).toBe(3);
  });
});
