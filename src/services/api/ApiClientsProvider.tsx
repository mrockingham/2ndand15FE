import type { PropsWithChildren } from 'react';

import type { ApiClients } from '@/services/api/apiClients';
import { ApiClientsContext } from '@/services/api/apiClientsContext';

interface ApiClientsProviderProps extends PropsWithChildren {
  readonly clients: ApiClients;
}

export const ApiClientsProvider = ({
  children,
  clients,
}: ApiClientsProviderProps) => (
  <ApiClientsContext.Provider value={clients}>
    {children}
  </ApiClientsContext.Provider>
);
