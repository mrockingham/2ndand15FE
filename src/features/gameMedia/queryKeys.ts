import type { AdminGameMediaListFilters } from '@/features/gameMedia/types';

const normalizeListFilters = (filters: AdminGameMediaListFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  week: filters.week,
});

export const adminGameMediaKeys = {
  all: ['admin', 'game-media'] as const,
  lists: () => [...adminGameMediaKeys.all, 'list'] as const,
  list: (filters: AdminGameMediaListFilters) =>
    [...adminGameMediaKeys.lists(), normalizeListFilters(filters)] as const,
  details: () => [...adminGameMediaKeys.all, 'detail'] as const,
  detail: (gameId: string) =>
    [...adminGameMediaKeys.details(), gameId] as const,
};

export const gameMediaKeys = {
  all: ['game-media'] as const,
  detail: (gameId: string) => [...gameMediaKeys.all, gameId] as const,
};
