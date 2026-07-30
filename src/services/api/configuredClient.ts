import { createApiClient } from '@/services/api/apiClient';
import { readAppEnvironment } from '@/services/api/environment';

export const createConfiguredApiClient = () => {
  const environment = readAppEnvironment(import.meta.env);

  return createApiClient({ baseUrl: environment.apiBaseUrl });
};
