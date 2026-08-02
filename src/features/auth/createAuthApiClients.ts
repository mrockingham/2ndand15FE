import type { QueryClient } from '@tanstack/react-query';

import { refreshSession } from '@/features/auth/api';
import { clearAuthentication, establishSession } from '@/features/auth/session';
import { createApiClient } from '@/services/api/apiClient';
import type { ApiClients } from '@/services/api/apiClients';
import { useAuthStore } from '@/stores/authStore';

interface CreateAuthApiClientsOptions {
  readonly baseUrl: string;
  readonly queryClient: QueryClient;
  readonly fetchImplementation?: typeof fetch;
}

export const createAuthApiClients = ({
  baseUrl,
  queryClient,
  fetchImplementation,
}: CreateAuthApiClientsOptions): ApiClients => {
  const publicClient = createApiClient({ baseUrl, fetchImplementation });
  const authenticatedClient = createApiClient({
    baseUrl,
    fetchImplementation,
    getAccessToken: () => useAuthStore.getState().accessToken,
    refreshAccessToken: async () => {
      const session = await refreshSession(publicClient);
      establishSession(queryClient, session);
      return session.accessToken;
    },
    onAuthenticationFailure: () => clearAuthentication(queryClient),
  });

  return { publicClient, authenticatedClient };
};
