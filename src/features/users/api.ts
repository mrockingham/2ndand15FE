import type { CurrentUserResponse } from '@/features/users/types';
import type { ApiClient } from '@/services/api/apiClient';

export const getCurrentUser = async (
  apiClient: ApiClient,
  signal?: AbortSignal,
) => {
  const response = await apiClient.request<CurrentUserResponse>('/users/me', {
    authenticated: true,
    method: 'GET',
    signal,
  });
  return response.data.user;
};
