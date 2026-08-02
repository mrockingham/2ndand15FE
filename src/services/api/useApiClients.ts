import { useContext } from 'react';

import { ApiClientsContext } from '@/services/api/apiClientsContext';

export const useApiClients = () => {
  const clients = useContext(ApiClientsContext);
  if (clients === null) {
    throw new Error('useApiClients must be used within ApiClientsProvider.');
  }
  return clients;
};
