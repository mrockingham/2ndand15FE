import type { QueryClient } from '@tanstack/react-query';

import { createAuthApiClients } from '@/features/auth/createAuthApiClients';
import { readAppEnvironment } from '@/services/api/environment';

export const createConfiguredApiClients = (
  queryClient: QueryClient,
  fetchImplementation?: typeof fetch,
) => {
  const environment = readAppEnvironment(import.meta.env);

  return createAuthApiClients({
    baseUrl: environment.apiBaseUrl,
    queryClient,
    fetchImplementation,
  });
};
