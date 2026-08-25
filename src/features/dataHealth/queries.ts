import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getDataHealthGame,
  listDataHealthGames,
  listDataHealthProbes,
  runDataHealthProbe,
} from '@/features/dataHealth/api';
import { dataHealthKeys } from '@/features/dataHealth/queryKeys';
import type { DataHealthGameListFilters } from '@/features/dataHealth/types';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const adminRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useDataHealthGamesQuery = (filters: DataHealthGameListFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: dataHealthKeys.games(filters),
    queryFn: ({ signal }) =>
      listDataHealthGames(authenticatedClient, filters, signal),
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useDataHealthGameQuery = (gameId: string, enabled: boolean) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: dataHealthKeys.game(gameId),
    queryFn: ({ signal }) =>
      getDataHealthGame(authenticatedClient, gameId, signal),
    enabled: enabled && gameId !== '',
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useDataHealthProbesQuery = (gameId: string, enabled: boolean) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: dataHealthKeys.probes(gameId),
    queryFn: ({ signal }) =>
      listDataHealthProbes(authenticatedClient, gameId, signal),
    enabled: enabled && gameId !== '',
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useRunDataHealthProbeMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => runDataHealthProbe(authenticatedClient, gameId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dataHealthKeys.game(gameId),
      });
      void queryClient.invalidateQueries({
        queryKey: dataHealthKeys.probes(gameId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...dataHealthKeys.all, 'games'],
      });
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
