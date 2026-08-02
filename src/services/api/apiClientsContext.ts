import { createContext } from 'react';

import type { ApiClients } from '@/services/api/apiClients';

export const ApiClientsContext = createContext<ApiClients | null>(null);
