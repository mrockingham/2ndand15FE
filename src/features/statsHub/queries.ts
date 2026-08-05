import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getRecentPerformance,
  getSeasonLeaders,
  getStatsMetadata,
  getWeeklyLeaders,
} from '@/features/statsHub/api';
import { statsHubKeys } from '@/features/statsHub/queryKeys';
import type {
  LeaderboardFilters,
  LeaderboardPage,
  RecentPerformanceFilters,
  SeasonLeader,
  StatsView,
  WeeklyLeader,
} from '@/features/statsHub/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const METADATA_STALE_TIME = 24 * 60 * 60_000;
const HISTORICAL_STALE_TIME = 6 * 60 * 60_000;
const retryPublic = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useStatsMetadataQuery = () => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: statsHubKeys.metadata(),
    queryFn: ({ signal }) => getStatsMetadata(publicClient, signal),
    staleTime: METADATA_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};

export const useLeaderboardQuery = (
  view: StatsView,
  filters: LeaderboardFilters,
  enabled: boolean,
) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery<
    LeaderboardPage<SeasonLeader | WeeklyLeader>,
    unknown,
    {
      pages: LeaderboardPage<SeasonLeader | WeeklyLeader>[];
      pageParams: unknown[];
    },
    | ReturnType<typeof statsHubKeys.season>
    | ReturnType<typeof statsHubKeys.weekly>,
    string | undefined
  >({
    queryKey:
      view === 'season'
        ? statsHubKeys.season(filters)
        : statsHubKeys.weekly(filters),
    queryFn: async ({ signal, pageParam }) =>
      view === 'season'
        ? await getSeasonLeaders(publicClient, filters, signal, pageParam)
        : await getWeeklyLeaders(publicClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
    staleTime: HISTORICAL_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};

export const useRecentPerformanceQuery = (
  filters: RecentPerformanceFilters | null,
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey:
      filters === null
        ? [...statsHubKeys.all, 'recent', 'idle']
        : statsHubKeys.recent(filters),
    queryFn: ({ signal }) => {
      if (filters === null) throw new Error('Recent filters are required.');
      return getRecentPerformance(publicClient, filters, signal);
    },
    enabled: filters !== null,
    staleTime: HISTORICAL_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};
