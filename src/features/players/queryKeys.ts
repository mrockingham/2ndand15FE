import type {
  PlayerListFilters,
  PlayerStatsFilters,
} from '@/features/players/types';

const normalizeList = (filters: PlayerListFilters) => ({
  limit: filters.limit ?? 20,
  search: filters.search?.trim() || undefined,
  teamId: filters.teamId || undefined,
  position: filters.position?.trim().toUpperCase() || undefined,
  season: filters.season,
});

const normalizeStats = (filters: PlayerStatsFilters) => ({
  limit: filters.limit ?? 100,
  season: filters.season,
  week: filters.week,
  seasonType: filters.seasonType,
});

export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: PlayerListFilters) =>
    [...playerKeys.lists(), normalizeList(filters)] as const,
  searches: () => [...playerKeys.all, 'search'] as const,
  search: (filters: PlayerListFilters) =>
    [...playerKeys.searches(), normalizeList(filters)] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (playerId: string) => [...playerKeys.details(), playerId] as const,
  statsFamily: (playerId: string) =>
    [...playerKeys.detail(playerId), 'stats'] as const,
  stats: (playerId: string, filters: PlayerStatsFilters) =>
    [...playerKeys.statsFamily(playerId), normalizeStats(filters)] as const,
  seasons: (playerId: string) =>
    [...playerKeys.detail(playerId), 'seasons'] as const,
};
