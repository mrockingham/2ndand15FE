import {
  DEFAULT_STALE_TIME_MS,
  FINALIZED_STALE_TIME_MS,
  GAME_HALFTIME_REFETCH_MS,
  GAME_LIVE_REFETCH_MS,
  GAME_PREGAME_REFETCH_MS,
  getGameCenterStaleTime,
  getGameRefetchInterval,
  getPlaysRefetchInterval,
  getStatsRefetchInterval,
  PLAYS_HALFTIME_REFETCH_MS,
  PLAYS_LIVE_REFETCH_MS,
  PREGAME_WINDOW_MS,
  STATS_HALFTIME_REFETCH_MS,
  STATS_LIVE_REFETCH_MS,
} from '@/features/games/gameCenterPolling';
import { gameFixture } from '@/test/gameFixtures';
import type { Game, GameStatus } from '@/features/games/types';

const NOW = new Date('2026-08-23T00:00:00.000Z').getTime();

const withStatus = (
  status: GameStatus,
  startTime: string | null = null,
): Game => ({
  ...gameFixture,
  status,
  startTime,
});

describe('getGameRefetchInterval', () => {
  it('does not poll a scheduled game more than 10 minutes from kickoff', () => {
    const kickoff = new Date(NOW + PREGAME_WINDOW_MS + 60_000).toISOString();
    expect(getGameRefetchInterval(withStatus('SCHEDULED', kickoff), NOW)).toBe(
      false,
    );
  });

  it('polls every 30s within 10 minutes of kickoff', () => {
    const kickoff = new Date(NOW + PREGAME_WINDOW_MS - 60_000).toISOString();
    expect(getGameRefetchInterval(withStatus('SCHEDULED', kickoff), NOW)).toBe(
      GAME_PREGAME_REFETCH_MS,
    );
    expect(getGameRefetchInterval(withStatus('PREGAME', kickoff), NOW)).toBe(
      GAME_PREGAME_REFETCH_MS,
    );
  });

  it('does not poll a scheduled game with no known kickoff time', () => {
    expect(getGameRefetchInterval(withStatus('SCHEDULED', null), NOW)).toBe(
      false,
    );
  });

  it('polls live games every 15 seconds', () => {
    expect(getGameRefetchInterval(withStatus('IN_PROGRESS'), NOW)).toBe(
      GAME_LIVE_REFETCH_MS,
    );
  });

  it('polls halftime games every 30 seconds', () => {
    expect(getGameRefetchInterval(withStatus('HALFTIME'), NOW)).toBe(
      GAME_HALFTIME_REFETCH_MS,
    );
  });

  it('stops polling once a game is finalized', () => {
    for (const status of [
      'FINAL',
      'POSTPONED',
      'CANCELED',
      'SUSPENDED',
    ] as const) {
      expect(getGameRefetchInterval(withStatus(status), NOW)).toBe(false);
    }
  });

  it('is conservative (no polling) for an unrecognized status', () => {
    const malformed = { ...gameFixture, status: 'UNKNOWN' as GameStatus };
    expect(getGameRefetchInterval(malformed, NOW)).toBe(false);
  });

  it('does not poll when the game has not loaded yet', () => {
    expect(getGameRefetchInterval(undefined, NOW)).toBe(false);
  });
});

describe('getPlaysRefetchInterval / getStatsRefetchInterval', () => {
  it('never poll before kickoff, regardless of the pregame window', () => {
    const kickoff = new Date(NOW + 60_000).toISOString();
    expect(getPlaysRefetchInterval(withStatus('SCHEDULED', kickoff))).toBe(
      false,
    );
    expect(getStatsRefetchInterval(withStatus('SCHEDULED', kickoff))).toBe(
      false,
    );
  });

  it('poll live games at 15s (plays) and 30s (stats)', () => {
    expect(getPlaysRefetchInterval(withStatus('IN_PROGRESS'))).toBe(
      PLAYS_LIVE_REFETCH_MS,
    );
    expect(getStatsRefetchInterval(withStatus('IN_PROGRESS'))).toBe(
      STATS_LIVE_REFETCH_MS,
    );
  });

  it('poll halftime games more slowly at 30s (plays) and 60s (stats)', () => {
    expect(getPlaysRefetchInterval(withStatus('HALFTIME'))).toBe(
      PLAYS_HALFTIME_REFETCH_MS,
    );
    expect(getStatsRefetchInterval(withStatus('HALFTIME'))).toBe(
      STATS_HALFTIME_REFETCH_MS,
    );
  });

  it('stop polling once finalized', () => {
    expect(getPlaysRefetchInterval(withStatus('FINAL'))).toBe(false);
    expect(getStatsRefetchInterval(withStatus('FINAL'))).toBe(false);
  });
});

describe('getGameCenterStaleTime', () => {
  it('uses a long stale time once finalized', () => {
    expect(getGameCenterStaleTime(withStatus('FINAL'), 'game')).toBe(
      FINALIZED_STALE_TIME_MS,
    );
    expect(getGameCenterStaleTime(withStatus('FINAL'), 'plays')).toBe(
      FINALIZED_STALE_TIME_MS,
    );
  });

  it('matches the active polling interval so a refocus after being hidden is treated as stale', () => {
    expect(getGameCenterStaleTime(withStatus('IN_PROGRESS'), 'game', NOW)).toBe(
      GAME_LIVE_REFETCH_MS,
    );
    expect(
      getGameCenterStaleTime(withStatus('IN_PROGRESS'), 'stats', NOW),
    ).toBe(STATS_LIVE_REFETCH_MS);
  });

  it('falls back to the default stale time when no interval is active', () => {
    const farOut = new Date(NOW + PREGAME_WINDOW_MS * 10).toISOString();
    expect(
      getGameCenterStaleTime(withStatus('SCHEDULED', farOut), 'game', NOW),
    ).toBe(DEFAULT_STALE_TIME_MS);
  });

  it('falls back to the default stale time when the game has not loaded yet', () => {
    expect(getGameCenterStaleTime(undefined, 'game', NOW)).toBe(
      DEFAULT_STALE_TIME_MS,
    );
  });
});
