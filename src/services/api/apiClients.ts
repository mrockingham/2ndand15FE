import type { ApiClient } from '@/services/api/apiClient';

export interface ApiClients {
  readonly publicClient: ApiClient;
  readonly authenticatedClient: ApiClient;
}
