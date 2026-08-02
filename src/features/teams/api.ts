import type { TeamListResponse } from '@/features/teams/types';
import type { CurrentUserResponse } from '@/features/users/types';
import type { ApiClient } from '@/services/api/apiClient';

export const getTeams = async (apiClient: ApiClient, signal?: AbortSignal) => {
  const response = await apiClient.request<TeamListResponse>('/teams', {
    method: 'GET',
    signal,
  });
  return response.data;
};

export const updateFavoriteTeam = async (
  apiClient: ApiClient,
  favoriteTeamId: string | null,
) => {
  const response = await apiClient.request<CurrentUserResponse>(
    '/users/me/favorite-team',
    {
      authenticated: true,
      body: { favoriteTeamId },
      method: 'PATCH',
    },
  );
  return response.data.user;
};
