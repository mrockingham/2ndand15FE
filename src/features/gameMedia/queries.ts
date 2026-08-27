import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminAuditKeys } from '@/features/admin/queryKeys';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import {
  createCuratedVideo,
  deleteCuratedVideo,
  deleteGlobalVideo,
  getAdminGameMediaDetail,
  getGameMedia,
  getGlobalVideo,
  listAdminGameMedia,
  putGlobalVideo,
  reorderCuratedVideos,
  updateCuratedVideo,
} from '@/features/gameMedia/api';
import {
  adminGameMediaKeys,
  gameMediaKeys,
} from '@/features/gameMedia/queryKeys';
import type {
  AdminGameMediaDetail,
  AdminGameMediaListFilters,
  CuratedVideoInput,
  CuratedVideoUpdateInput,
  GlobalVideo,
  GlobalVideoInput,
  ReorderVideosInput,
} from '@/features/gameMedia/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const GAME_CENTER_STALE_TIME = 5 * 60_000;

const adminRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

const publicRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useAdminGameMediaListQuery = (
  filters: AdminGameMediaListFilters,
) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminGameMediaKeys.list(filters),
    queryFn: ({ signal }) =>
      listAdminGameMedia(authenticatedClient, filters, signal),
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useAdminGameMediaDetailQuery = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminGameMediaKeys.detail(gameId),
    queryFn: ({ signal }) =>
      getAdminGameMediaDetail(authenticatedClient, gameId, signal),
    enabled: gameId !== '',
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useGameMediaQuery = (gameId: string) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: gameMediaKeys.detail(gameId),
    queryFn: ({ signal }) => getGameMedia(publicClient, gameId, signal),
    enabled: gameId !== '',
    staleTime: GAME_CENTER_STALE_TIME,
    refetchOnMount: 'always',
    retry: publicRetry,
  });
};

const useGameMediaAdminSuccess = (gameId: string) => {
  const queryClient = useQueryClient();
  return (detail: AdminGameMediaDetail) => {
    queryClient.setQueryData(adminGameMediaKeys.detail(gameId), detail);
    void queryClient.invalidateQueries({
      queryKey: adminGameMediaKeys.lists(),
    });
    void queryClient.invalidateQueries({
      queryKey: gameMediaKeys.detail(gameId),
    });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
  };
};

const useGameMediaAdminInvalidateOnly = (gameId: string) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: adminGameMediaKeys.detail(gameId),
    });
    void queryClient.invalidateQueries({
      queryKey: adminGameMediaKeys.lists(),
    });
    void queryClient.invalidateQueries({
      queryKey: gameMediaKeys.detail(gameId),
    });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
  };
};

export const useCreateCuratedVideoMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameMediaAdminInvalidateOnly(gameId);
  const mutation = useMutation({
    mutationFn: (input: CuratedVideoInput) =>
      createCuratedVideo(authenticatedClient, gameId, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useUpdateCuratedVideoMutation = (
  gameId: string,
  videoId: string,
) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameMediaAdminInvalidateOnly(gameId);
  const mutation = useMutation({
    mutationFn: (input: CuratedVideoUpdateInput) =>
      updateCuratedVideo(authenticatedClient, videoId, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useReorderCuratedVideosMutation = (gameId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameMediaAdminSuccess(gameId);
  const mutation = useMutation({
    mutationFn: (input: ReorderVideosInput) =>
      reorderCuratedVideos(authenticatedClient, gameId, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useDeleteCuratedVideoMutation = (
  gameId: string,
  videoId: string,
) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGameMediaAdminInvalidateOnly(gameId);
  const mutation = useMutation({
    mutationFn: () => deleteCuratedVideo(authenticatedClient, videoId),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useGlobalVideoQuery = () => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminGameMediaKeys.globalVideo(),
    queryFn: ({ signal }) => getGlobalVideo(authenticatedClient, signal),
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

// The global video affects every game's public media and every game's
// admin list/detail entry (hasGlobalVideo/displayMode), so its mutations
// invalidate broadly rather than a single gameId's keys.
const useGlobalVideoSuccess = () => {
  const queryClient = useQueryClient();
  return (video: GlobalVideo | null) => {
    queryClient.setQueryData(adminGameMediaKeys.globalVideo(), video);
    void queryClient.invalidateQueries({
      queryKey: adminGameMediaKeys.lists(),
    });
    void queryClient.invalidateQueries({
      queryKey: adminGameMediaKeys.details(),
    });
    void queryClient.invalidateQueries({ queryKey: gameMediaKeys.all });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
  };
};

export const useSaveGlobalVideoMutation = () => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGlobalVideoSuccess();
  const mutation = useMutation({
    mutationFn: (input: GlobalVideoInput) =>
      putGlobalVideo(authenticatedClient, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useDeleteGlobalVideoMutation = () => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useGlobalVideoSuccess();
  const mutation = useMutation({
    mutationFn: () => deleteGlobalVideo(authenticatedClient),
    onSuccess: () => onSuccess(null),
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
