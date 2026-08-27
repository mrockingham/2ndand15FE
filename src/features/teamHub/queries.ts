import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getTeamHub,
  getTeamRoster,
  getTeamStatLeaders,
} from '@/features/teamHub/api';
import { teamHubKeys } from '@/features/teamHub/queryKeys';
import type {
  TeamLeaderFilters,
  TeamRosterFilters,
} from '@/features/teamHub/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const publicRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useTeamHubQuery = (teamId: string, enabled = true) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: teamHubKeys.overview(teamId),
    queryFn: ({ signal }) => getTeamHub(publicClient, teamId, signal),
    enabled: enabled && teamId !== '',
    staleTime: 5 * 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: publicRetry,
  });
};

export const useTeamRosterQuery = (
  teamId: string,
  filters: TeamRosterFilters,
  enabled: boolean,
) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery({
    queryKey: teamHubKeys.roster(teamId, filters),
    queryFn: ({ signal, pageParam }) =>
      getTeamRoster(publicClient, teamId, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && teamId !== '',
    staleTime: 24 * 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: publicRetry,
  });
};

export const useTeamLeadersQuery = (
  teamId: string,
  filters: TeamLeaderFilters,
  enabled: boolean,
) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery({
    queryKey: teamHubKeys.leader(teamId, filters),
    queryFn: ({ signal, pageParam }) =>
      getTeamStatLeaders(publicClient, teamId, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && teamId !== '',
    staleTime: 6 * 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: publicRetry,
  });
};
