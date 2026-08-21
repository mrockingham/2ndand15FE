import type {
  TeamLeaderFilters,
  TeamRosterFilters,
} from '@/features/teamHub/types';

const normalizeRoster = (filters: TeamRosterFilters) => ({
  season: filters.season,
  position: filters.position?.trim().toUpperCase() || undefined,
  positionGroup: filters.positionGroup?.trim().toUpperCase() || undefined,
  search: filters.search?.trim() || undefined,
  limit: filters.limit,
});

const normalizeLeaders = (filters: TeamLeaderFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  metric: filters.metric,
  position: filters.position?.trim().toUpperCase() || undefined,
  positionGroup: filters.positionGroup?.trim().toUpperCase() || undefined,
  limit: filters.limit,
});

export const teamHubKeys = {
  all: ['teamHub'] as const,
  overviews: () => [...teamHubKeys.all, 'overview'] as const,
  overview: (teamId: string) => [...teamHubKeys.overviews(), teamId] as const,
  rosters: (teamId: string) => [...teamHubKeys.all, 'roster', teamId] as const,
  roster: (teamId: string, filters: TeamRosterFilters) =>
    [...teamHubKeys.rosters(teamId), normalizeRoster(filters)] as const,
  leaders: (teamId: string) => [...teamHubKeys.all, 'leaders', teamId] as const,
  leader: (teamId: string, filters: TeamLeaderFilters) =>
    [...teamHubKeys.leaders(teamId), normalizeLeaders(filters)] as const,
};
