import { isFinalizedGameStatus } from '@/features/games/presentation';
import type { Game } from '@/features/games/types';

export const GAME_LIVE_REFETCH_MS = 15_000;
export const PLAYS_LIVE_REFETCH_MS = 15_000;
export const STATS_LIVE_REFETCH_MS = 30_000;

export const GAME_HALFTIME_REFETCH_MS = 30_000;
export const PLAYS_HALFTIME_REFETCH_MS = 30_000;
export const STATS_HALFTIME_REFETCH_MS = 60_000;

export const PREGAME_WINDOW_MS = 10 * 60_000;
export const GAME_PREGAME_REFETCH_MS = 30_000;

export const FINALIZED_STALE_TIME_MS = 24 * 60 * 60_000;
export const DEFAULT_STALE_TIME_MS = 5 * 60_000;

const isWithinPregameWindow = (game: Game, now: number) => {
  if (game.startTime === null) return false;
  const kickoff = new Date(game.startTime).getTime();
  if (Number.isNaN(kickoff)) return false;
  return kickoff - now <= PREGAME_WINDOW_MS;
};

export const getGameRefetchInterval = (
  game: Game | undefined,
  now = Date.now(),
): number | false => {
  if (game === undefined) return false;
  switch (game.status) {
    case 'IN_PROGRESS':
      return GAME_LIVE_REFETCH_MS;
    case 'HALFTIME':
      return GAME_HALFTIME_REFETCH_MS;
    case 'SCHEDULED':
    case 'PREGAME':
      return isWithinPregameWindow(game, now) ? GAME_PREGAME_REFETCH_MS : false;
    default:
      return false;
  }
};

export const getPlaysRefetchInterval = (
  game: Game | undefined,
): number | false => {
  if (game === undefined) return false;
  switch (game.status) {
    case 'IN_PROGRESS':
      return PLAYS_LIVE_REFETCH_MS;
    case 'HALFTIME':
      return PLAYS_HALFTIME_REFETCH_MS;
    default:
      return false;
  }
};

export const getStatsRefetchInterval = (
  game: Game | undefined,
): number | false => {
  if (game === undefined) return false;
  switch (game.status) {
    case 'IN_PROGRESS':
      return STATS_LIVE_REFETCH_MS;
    case 'HALFTIME':
      return STATS_HALFTIME_REFETCH_MS;
    default:
      return false;
  }
};

export type GameCenterQueryKind = 'game' | 'plays' | 'stats';

const REFETCH_INTERVAL_BY_KIND: Readonly<
  Record<
    GameCenterQueryKind,
    (game: Game | undefined, now: number) => number | false
  >
> = {
  game: getGameRefetchInterval,
  plays: getPlaysRefetchInterval,
  stats: getStatsRefetchInterval,
};

export const getGameCenterStaleTime = (
  game: Game | undefined,
  kind: GameCenterQueryKind,
  now = Date.now(),
): number => {
  if (game === undefined) return DEFAULT_STALE_TIME_MS;
  if (isFinalizedGameStatus(game.status)) return FINALIZED_STALE_TIME_MS;
  const interval = REFETCH_INTERVAL_BY_KIND[kind](game, now);
  return interval === false ? DEFAULT_STALE_TIME_MS : interval;
};
