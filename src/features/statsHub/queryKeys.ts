import type {
  LeaderboardFilters,
  RecentPerformanceFilters,
} from '@/features/statsHub/types';
import type { CurrentStatsFilters } from '@/features/statsHub/currentTypes';

const normalizeLeaderboard = (filters: LeaderboardFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  metric: filters.metric,
  week: filters.week,
  position: filters.position?.trim().toUpperCase() || undefined,
  positionGroup: filters.positionGroup?.trim().toUpperCase() || undefined,
  teamId: filters.teamId || undefined,
  limit: filters.limit,
});

const normalizeRecent = (filters: RecentPerformanceFilters) => ({
  playerId: filters.playerId,
  metric: filters.metric,
  season: filters.season,
  seasonType: filters.seasonType,
  games: filters.games,
});

export const statsHubKeys = {
  all: ['statsHub'] as const,
  metadata: () => [...statsHubKeys.all, 'metadata'] as const,
  current: (filters: CurrentStatsFilters) =>
    [
      ...statsHubKeys.all,
      'current',
      {
        season: filters.season,
        seasonType: filters.seasonType,
        week: filters.week,
        teamId: filters.teamId || undefined,
      },
    ] as const,
  season: (filters: LeaderboardFilters) =>
    [...statsHubKeys.all, 'season', normalizeLeaderboard(filters)] as const,
  weekly: (filters: LeaderboardFilters) =>
    [...statsHubKeys.all, 'weekly', normalizeLeaderboard(filters)] as const,
  recent: (filters: RecentPerformanceFilters) =>
    [...statsHubKeys.all, 'recent', normalizeRecent(filters)] as const,
};
