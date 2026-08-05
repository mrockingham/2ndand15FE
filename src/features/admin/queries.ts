import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminGame,
  deleteGameOverride,
  getAdminGame,
  listAdminGames,
  listAuditEvents,
  updateAdminGame,
  upsertGameOverride,
  validateScheduleImport,
  verifyAdminGame,
  writeScheduleImport,
} from '@/features/admin/api';
import { adminAuditKeys, adminGameKeys } from '@/features/admin/queryKeys';
import { gameKeys } from '@/features/games/queryKeys';
import type {
  AdminGame,
  AdminGameListFilters,
  AuditFilters,
  GameOverrideInput,
  ManualGameCreateInput,
  ManualGameUpdateInput,
  ScheduleImportRow,
  VerificationInput,
} from '@/features/admin/types';
import { userKeys } from '@/features/users/queryKeys';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

export const useRefreshRoleOnForbidden = (error: unknown) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (error instanceof ApiError && error.status === 403) {
      void queryClient.invalidateQueries({
        queryKey: userKeys.me,
        exact: true,
      });
    }
  }, [error, queryClient]);
};

export const useAdminGamesQuery = (filters: AdminGameListFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminGameKeys.list(filters),
    queryFn: ({ signal }) =>
      listAdminGames(authenticatedClient, filters, signal),
    staleTime: 30_000,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status < 500) && count < 2,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useAdminGameQuery = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminGameKeys.detail(gameId),
    queryFn: ({ signal }) => getAdminGame(authenticatedClient, gameId, signal),
    enabled: gameId !== '',
    retry: (count, error) =>
      !(error instanceof ApiError && error.status < 500) && count < 2,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useGameWriteSuccess = () => {
  const queryClient = useQueryClient();
  return (game: AdminGame) => {
    queryClient.setQueryData(adminGameKeys.detail(game.id), game);
    queryClient.setQueryData(gameKeys.detail(game.id), game.resolved);
    void queryClient.invalidateQueries({ queryKey: adminGameKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
    void queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: gameKeys.teamLists() });
  };
};

export const useCreateAdminGameMutation = () => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameWriteSuccess();
  return useMutation({
    mutationFn: (input: ManualGameCreateInput) =>
      createAdminGame(authenticatedClient, input),
    onSuccess,
  });
};

export const useUpdateAdminGameMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameWriteSuccess();
  return useMutation({
    mutationFn: (input: ManualGameUpdateInput) =>
      updateAdminGame(authenticatedClient, gameId, input),
    onSuccess,
  });
};

export const useOverrideMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameWriteSuccess();
  return useMutation({
    mutationFn: (input: GameOverrideInput) =>
      upsertGameOverride(authenticatedClient, gameId, input),
    onSuccess,
  });
};

export const useDeleteOverrideMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameWriteSuccess();
  return useMutation({
    mutationFn: () => deleteGameOverride(authenticatedClient, gameId),
    onSuccess,
  });
};

export const useVerifyGameMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameWriteSuccess();
  return useMutation({
    mutationFn: (input: VerificationInput) =>
      verifyAdminGame(authenticatedClient, gameId, input),
    onSuccess,
  });
};

export const useValidateImportMutation = () => {
  const { authenticatedClient } = useApiClients();
  return useMutation({
    mutationFn: (rows: readonly ScheduleImportRow[]) =>
      validateScheduleImport(authenticatedClient, rows),
  });
};

export const useWriteImportMutation = () => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: readonly ScheduleImportRow[]) =>
      writeScheduleImport(authenticatedClient, rows),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminGameKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
      void queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
};

export const useAuditEventsQuery = (filters: AuditFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminAuditKeys.list(filters),
    queryFn: ({ signal }) =>
      listAuditEvents(authenticatedClient, filters, signal),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status < 500) && count < 2,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useGameAuditQuery = (gameId: string, cursor?: string) => {
  const { authenticatedClient } = useApiClients();
  const filters = { entityType: 'GAME', entityId: gameId, limit: 25, cursor };
  const query = useQuery({
    queryKey: adminAuditKeys.game(gameId, cursor),
    queryFn: ({ signal }) =>
      listAuditEvents(authenticatedClient, filters, signal),
    enabled: gameId !== '',
    retry: false,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};
