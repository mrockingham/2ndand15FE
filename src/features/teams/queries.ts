import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTeams, updateFavoriteTeam } from '@/features/teams/api';
import { teamKeys } from '@/features/teams/queryKeys';
import { userKeys } from '@/features/users/queryKeys';
import { useApiClients } from '@/services/api/useApiClients';

const TEAM_CATALOG_STALE_TIME = 24 * 60 * 60_000;

export const useTeamsQuery = () => {
  const { publicClient } = useApiClients();

  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: ({ signal }) => getTeams(publicClient, signal),
    staleTime: TEAM_CATALOG_STALE_TIME,
    retry: 1,
  });
};

export const useFavoriteTeamMutation = () => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favoriteTeamId: string | null) =>
      updateFavoriteTeam(authenticatedClient, favoriteTeamId),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.me, user);
    },
  });
};
