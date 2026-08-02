import { useQuery } from '@tanstack/react-query';

import { useApiClients } from '@/services/api/useApiClients';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser } from '@/features/users/api';
import { userKeys } from '@/features/users/queryKeys';

export const useCurrentUserQuery = () => {
  const { authenticatedClient } = useApiClients();
  const accessToken = useAuthStore((state) => state.accessToken);
  const restorationStatus = useAuthStore((state) => state.restorationStatus);

  return useQuery({
    queryKey: userKeys.me,
    queryFn: ({ signal }) => getCurrentUser(authenticatedClient, signal),
    enabled: accessToken !== null && restorationStatus === 'authenticated',
    staleTime: 5 * 60_000,
    retry: 1,
  });
};
