import type { Game } from '@/features/games/types';
import {
  compareGames,
  gameDayKey,
  isGameUpcoming,
} from '@/features/games/utils/dateTime';

const LIVE_STATUSES = new Set(['IN_PROGRESS', 'HALFTIME']);
const RECENT_FINAL_WINDOW_MS = 48 * 60 * 60_000;
const DEFAULT_MAX_CARDS = 14;

export const isLiveGameStatus = (status: Game['status']) =>
  LIVE_STATUSES.has(status);

const isWellFormedGame = (game: Game): boolean =>
  typeof game?.id === 'string' &&
  game.awayTeam !== undefined &&
  game.homeTeam !== undefined;

const isRecentFinal = (game: Game, now: Date) => {
  if (game.status !== 'FINAL') return false;
  if (game.startTime === null) return false;
  const kickoff = new Date(game.startTime).getTime();
  if (Number.isNaN(kickoff)) return false;
  return now.getTime() - kickoff <= RECENT_FINAL_WINDOW_MS;
};

/**
 * Picks a compact, stable-order set of scoreboard-relevant games from an
 * already-windowed fetch: every live game, everything kicking off today,
 * recently finalized games, then the nearest upcoming games to fill out the
 * card count. The result is always re-sorted chronologically so polling
 * refreshes update card contents in place rather than reordering the strip.
 */
export const selectScoreboardGames = (
  games: readonly Game[],
  now = new Date(),
  maxCards = DEFAULT_MAX_CARDS,
): Game[] => {
  const todayKey = gameDayKey(now.toISOString());
  const selected = new Map<string, Game>();
  const wellFormedGames = games.filter(isWellFormedGame);

  for (const game of wellFormedGames) {
    if (isLiveGameStatus(game.status)) selected.set(game.id, game);
  }
  for (const game of wellFormedGames) {
    if (selected.size >= maxCards) break;
    if (gameDayKey(game.startTime) === todayKey) selected.set(game.id, game);
  }
  for (const game of [...wellFormedGames].sort(compareGames)) {
    if (selected.size >= maxCards) break;
    if (isRecentFinal(game, now)) selected.set(game.id, game);
  }
  for (const game of [...wellFormedGames]
    .filter((g) => isGameUpcoming(g, now))
    .sort(compareGames)) {
    if (selected.size >= maxCards) break;
    selected.set(game.id, game);
  }

  return [...selected.values()].sort(compareGames);
};
