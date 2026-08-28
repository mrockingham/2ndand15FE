import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import {
  addEditorialPlacement,
  addHighlightPlacement,
  getAdminTeamHomepage,
  listEditorialCandidates,
  listHighlightCandidates,
  removeEditorialPlacement,
  removeHighlightPlacement,
  reorderEditorialPlacements,
  reorderHighlightPlacements,
  updateEditorialPlacement,
  updateTeamHighlightSettings,
  updateTeamHomepageBanner,
} from '@/features/teamHomepage/api';
import { adminTeamHomepageKeys } from '@/features/teamHomepage/queryKeys';
import type {
  AddEditorialInput,
  AddHighlightInput,
  AdminTeamHomepage,
  ReorderPlacementsInput,
  TeamHomepageHighlightSettings,
  UpdateTeamBannerInput,
} from '@/features/teamHomepage/types';
import { teamHubKeys } from '@/features/teamHub/queryKeys';
import { useApiClients } from '@/services/api/useApiClients';

export const useAdminTeamHomepageQuery = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminTeamHomepageKeys.detail(teamId),
    queryFn: ({ signal }) =>
      getAdminTeamHomepage(authenticatedClient, teamId, signal),
    enabled: teamId !== '',
    staleTime: 15_000,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useEditorialCandidatesQuery = (
  teamId: string,
  enabled: boolean,
) => {
  const { authenticatedClient } = useApiClients();
  const query = useInfiniteQuery({
    queryKey: adminTeamHomepageKeys.editorialCandidates(teamId),
    queryFn: ({ signal, pageParam }) =>
      listEditorialCandidates(authenticatedClient, teamId, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && teamId !== '',
    staleTime: 15_000,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useTeamHighlightCandidatesQuery = (
  teamId: string,
  enabled: boolean,
) => {
  const { authenticatedClient } = useApiClients();
  const query = useInfiniteQuery({
    queryKey: adminTeamHomepageKeys.highlightCandidates(teamId),
    queryFn: ({ signal, pageParam }) =>
      listHighlightCandidates(authenticatedClient, teamId, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && teamId !== '',
    staleTime: 15_000,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useInvalidateTeamHomepage = (
  teamId: string,
  candidates?: 'editorial' | 'highlights',
) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: adminTeamHomepageKeys.detail(teamId),
    });
    if (candidates === 'editorial')
      void queryClient.invalidateQueries({
        queryKey: adminTeamHomepageKeys.editorialCandidates(teamId),
      });
    if (candidates === 'highlights')
      void queryClient.invalidateQueries({
        queryKey: adminTeamHomepageKeys.highlightCandidates(teamId),
      });
    void queryClient.invalidateQueries({
      queryKey: teamHubKeys.overview(teamId),
    });
  };
};

export const useUpdateTeamBannerMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId);
  return useMutation({
    mutationFn: (input: UpdateTeamBannerInput) =>
      updateTeamHomepageBanner(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};

export const useAddEditorialMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'editorial');
  return useMutation({
    mutationFn: (input: AddEditorialInput) =>
      addEditorialPlacement(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateEditorialMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTeamHomepage(teamId, 'editorial');
  return useMutation({
    mutationFn: ({
      placementId,
      isLeadReplacement,
    }: {
      readonly placementId: string;
      readonly isLeadReplacement: boolean;
    }) =>
      updateEditorialPlacement(
        authenticatedClient,
        teamId,
        placementId,
        isLeadReplacement,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminTeamHomepage>(
        adminTeamHomepageKeys.detail(teamId),
        (current) =>
          current
            ? {
                ...current,
                editorial: {
                  placements: current.editorial.placements.map((placement) =>
                    placement.id === updated.id
                      ? updated
                      : placement.sourceType === 'VIDEO'
                        ? { ...placement, isLeadReplacement: false }
                        : placement,
                  ),
                },
              }
            : current,
      );
      invalidate();
    },
  });
};

export const useRemoveEditorialMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'editorial');
  return useMutation({
    mutationFn: (placementId: string) =>
      removeEditorialPlacement(authenticatedClient, teamId, placementId),
    onSuccess: invalidate,
  });
};

export const useReorderEditorialMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'editorial');
  return useMutation({
    mutationFn: (input: ReorderPlacementsInput) =>
      reorderEditorialPlacements(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};

export const useAddTeamHighlightMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'highlights');
  return useMutation({
    mutationFn: (input: AddHighlightInput) =>
      addHighlightPlacement(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};

export const useRemoveTeamHighlightMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'highlights');
  return useMutation({
    mutationFn: (placementId: string) =>
      removeHighlightPlacement(authenticatedClient, teamId, placementId),
    onSuccess: invalidate,
  });
};

export const useReorderTeamHighlightsMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'highlights');
  return useMutation({
    mutationFn: (input: ReorderPlacementsInput) =>
      reorderHighlightPlacements(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateTeamHighlightSettingsMutation = (teamId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTeamHomepage(teamId, 'highlights');
  return useMutation({
    mutationFn: (input: TeamHomepageHighlightSettings) =>
      updateTeamHighlightSettings(authenticatedClient, teamId, input),
    onSuccess: invalidate,
  });
};
