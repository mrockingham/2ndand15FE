import type { QueryClient } from '@tanstack/react-query';

import type { AuthenticationData } from '@/features/auth/types';
import { userKeys } from '@/features/users/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export const establishSession = (
  queryClient: QueryClient,
  session: AuthenticationData,
) => {
  const authStore = useAuthStore.getState();
  authStore.setSession(session);
  authStore.setRestorationStatus('authenticated');
  queryClient.setQueryData(userKeys.me, session.user);
};

export const clearAuthentication = (
  queryClient: QueryClient,
  status: 'anonymous' | 'error' = 'anonymous',
) => {
  const authStore = useAuthStore.getState();
  authStore.clearSession();
  authStore.setRestorationStatus(status);
  queryClient.removeQueries({ queryKey: userKeys.me, exact: true });
};
