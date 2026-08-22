import {
  formatDownDistance,
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
