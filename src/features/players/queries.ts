import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getPlayer,
  listPlayers,
  listPlayerSeasons,
  listPlayerStats,
} from '@/features/players/api';
import { playerKeys } from '@/features/players/queryKeys';
import type {
  PlayerListFilters,
  PlayerStatsFilters,
} from '@/features/players/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const HISTORICAL_STALE_TIME = 60 * 60_000;
const DIRECTORY_STALE_TIME = 10 * 60_000;
const retryPublic = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const usePlayersQuery = (filters: PlayerListFilters) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery({
    queryKey: playerKeys.list(filters),
    queryFn: ({ signal, pageParam }) =>
      listPlayers(publicClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: DIRECTORY_STALE_TIME,
    retry: retryPublic,
  });
};

export const usePlayerSearchQuery = (
  filters: PlayerListFilters,
  enabled: boolean,
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: playerKeys.search(filters),
    queryFn: ({ signal }) => listPlayers(publicClient, filters, signal),
    enabled,
    staleTime: DIRECTORY_STALE_TIME,
    retry: retryPublic,
  });
};

export const usePlayerQuery = (playerId: string) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: playerKeys.detail(playerId),
    queryFn: ({ signal }) => getPlayer(publicClient, playerId, signal),
    enabled: playerId !== '',
    staleTime: HISTORICAL_STALE_TIME,
    retry: retryPublic,
  });
};

export const usePlayerSeasonsQuery = (playerId: string) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: playerKeys.seasons(playerId),
    queryFn: ({ signal }) => listPlayerSeasons(publicClient, playerId, signal),
    enabled: playerId !== '',
    staleTime: HISTORICAL_STALE_TIME,
    retry: retryPublic,
  });
};

export const usePlayerStatsQuery = (
  playerId: string,
  filters: PlayerStatsFilters,
  enabled = true,
) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery({
    queryKey: playerKeys.stats(playerId, filters),
    queryFn: ({ signal, pageParam }) =>
      listPlayerStats(publicClient, playerId, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && playerId !== '',
    staleTime: HISTORICAL_STALE_TIME,
    retry: retryPublic,
  });
};
