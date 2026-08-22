import type { GameListFilters } from '@/features/games/types';

export const normalizeGameFilters = (filters: GameListFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  week: filters.week,
  startDate: filters.startDate,
  endDate: filters.endDate,
  teamId: filters.teamId,
  status: filters.status,
  limit: filters.limit,
});

export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (filters: GameListFilters) =>
    [...gameKeys.lists(), normalizeGameFilters(filters)] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (gameId: string) => [...gameKeys.details(), gameId] as const,
  plays: (gameId: string) => [...gameKeys.detail(gameId), 'plays'] as const,
  stats: (gameId: string) => [...gameKeys.detail(gameId), 'stats'] as const,
  teamLists: () => [...gameKeys.all, 'team-list'] as const,
  teamList: (teamId: string, filters: Omit<GameListFilters, 'teamId'>) =>
    [...gameKeys.teamLists(), teamId, normalizeGameFilters(filters)] as const,
};
