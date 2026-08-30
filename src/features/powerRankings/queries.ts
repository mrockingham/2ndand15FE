import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import {
  createPowerRankingEdition,
  getAdminPowerRankingEdition,
  getPowerRankingEditions,
  getPowerRankings,
  importPowerRankings,
  listAdminPowerRankingEditions,
  publishPowerRankingEdition,
  reorderPowerRankingEntries,
  unpublishPowerRankingEdition,
  updatePowerRankingEdition,
  updatePowerRankingEntry,
} from '@/features/powerRankings/api';
import {
  adminPowerRankingsKeys,
  powerRankingsKeys,
} from '@/features/powerRankings/queryKeys';
import type {
  CreatePowerRankingEditionInput,
  PowerRankingImportInput,
  PowerRankingsFilters,
  ReorderPowerRankingEntriesInput,
  UpdatePowerRankingEditionInput,
  UpdatePowerRankingEntryInput,
} from '@/features/powerRankings/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const publicRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

const adminRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status < 500) && count < 2;

export const usePowerRankingsQuery = (filters: PowerRankingsFilters) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: powerRankingsKeys.view(filters),
    queryFn: ({ signal }) => getPowerRankings(publicClient, filters, signal),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: publicRetry,
  });
};

export const usePowerRankingEditionsQuery = (season?: number) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: powerRankingsKeys.editions(season),
    queryFn: ({ signal }) =>
      getPowerRankingEditions(publicClient, season, signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: publicRetry,
  });
};

export const useAdminPowerRankingEditionsQuery = () => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminPowerRankingsKeys.list(),
    queryFn: ({ signal }) =>
      listAdminPowerRankingEditions(authenticatedClient, signal),
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useAdminPowerRankingEditionQuery = (editionId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminPowerRankingsKeys.detail(editionId),
    queryFn: ({ signal }) =>
      getAdminPowerRankingEdition(authenticatedClient, editionId, signal),
    enabled: editionId !== '',
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useInvalidatePowerRankings = () => {
  const queryClient = useQueryClient();
  return (editionId?: string) => {
    void queryClient.invalidateQueries({
      queryKey: adminPowerRankingsKeys.list(),
    });
    if (editionId !== undefined)
      void queryClient.invalidateQueries({
        queryKey: adminPowerRankingsKeys.detail(editionId),
      });
    void queryClient.invalidateQueries({ queryKey: powerRankingsKeys.all });
  };
};

export const useCreateEditionMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: (input: CreatePowerRankingEditionInput) =>
      createPowerRankingEdition(authenticatedClient, input),
    onSuccess: () => invalidate(),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useUpdateEditionMutation = (editionId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: (input: UpdatePowerRankingEditionInput) =>
      updatePowerRankingEdition(authenticatedClient, editionId, input),
    onSuccess: () => invalidate(editionId),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useUpdateEntryMutation = (editionId: string, entryId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: (input: UpdatePowerRankingEntryInput) =>
      updatePowerRankingEntry(authenticatedClient, editionId, entryId, input),
    onSuccess: () => invalidate(editionId),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useReorderEntriesMutation = (editionId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: (input: ReorderPowerRankingEntriesInput) =>
      reorderPowerRankingEntries(authenticatedClient, editionId, input),
    onSuccess: () => invalidate(editionId),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const usePublishEditionMutation = (editionId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: () =>
      publishPowerRankingEdition(authenticatedClient, editionId),
    onSuccess: () => invalidate(editionId),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useUnpublishEditionMutation = (editionId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: () =>
      unpublishPowerRankingEdition(authenticatedClient, editionId),
    onSuccess: () => invalidate(editionId),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useImportPowerRankingsMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidatePowerRankings();
  const mutation = useMutation({
    mutationFn: (input: PowerRankingImportInput) =>
      importPowerRankings(authenticatedClient, input),
    onSuccess: (_result, variables) => {
      // No auto-publish: an UPSERT writes edition/entry data, so refresh the
      // admin list/detail and the public cache, but never call publish here.
      if (variables.mode === 'UPSERT') invalidate();
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
