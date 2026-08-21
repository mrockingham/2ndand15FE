import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getGame, listGames, listTeamGames } from '@/features/games/api';
import { gameKeys } from '@/features/games/queryKeys';
import type { GameListFilters } from '@/features/games/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const SCHEDULE_STALE_TIME = 5 * 60_000;
const CURRENT_SCHEDULE_SEASON = 2026;
const isCurrentSchedule = (season: number | undefined) =>
  season === undefined || season === CURRENT_SCHEDULE_SEASON;
const retryPublicGameQuery = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useGamesQuery = (filters: GameListFilters, enabled = true) => {
  const { publicClient } = useApiClients();
  return useInfiniteQuery({
    queryKey: gameKeys.list(filters),
    queryFn: ({ signal, pageParam }) =>
      listGames(publicClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
    staleTime: SCHEDULE_STALE_TIME,
    refetchOnMount: isCurrentSchedule(filters.season) ? 'always' : true,
    retry: retryPublicGameQuery,
  });
};

export const useGameQuery = (gameId: string) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: gameKeys.detail(gameId),
    queryFn: ({ signal }) => getGame(publicClient, gameId, signal),
    enabled: gameId !== '',
    staleTime: SCHEDULE_STALE_TIME,
    refetchOnMount: 'always',
    retry: retryPublicGameQuery,
  });
};

export const useTeamGamesQuery = (
  teamId: string,
  filters: Omit<GameListFilters, 'teamId'>,
  enabled = true,
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: gameKeys.teamList(teamId, filters),
    queryFn: ({ signal }) =>
      listTeamGames(publicClient, teamId, filters, signal),
    enabled: enabled && teamId !== '',
    staleTime: SCHEDULE_STALE_TIME,
    refetchOnMount: isCurrentSchedule(filters.season) ? 'always' : true,
    retry: retryPublicGameQuery,
  });
};
