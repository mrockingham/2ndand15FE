import type { DataHealthGameListFilters } from '@/features/dataHealth/types';

const normalizeFilters = (filters: DataHealthGameListFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  week: filters.week,
  teamId: filters.teamId,
  gameStatus: filters.gameStatus,
  issuesOnly: filters.issuesOnly,
  limit: filters.limit,
  cursor: filters.cursor,
});

export const dataHealthKeys = {
  all: ['admin', 'data-health'] as const,
  games: (filters: DataHealthGameListFilters) =>
    [...dataHealthKeys.all, 'games', normalizeFilters(filters)] as const,
  game: (gameId: string) => [...dataHealthKeys.all, 'game', gameId] as const,
  probes: (gameId: string) =>
    [...dataHealthKeys.all, 'probes', gameId] as const,
};
