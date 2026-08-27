import { useState, type PropsWithChildren } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';

import { createAppQueryClient } from '@/app/queryClient';
import { createConfiguredApiClients } from '@/app/createConfiguredApiClients';
import { ApplicationErrorBoundary } from '@/components/feedback/ApplicationErrorBoundary';
import { SessionBootstrap } from '@/features/auth/components/SessionBootstrap';
import { TeamVisualThemeProvider } from '@/features/teamVisualIdentity/TeamVisualThemeProvider';
import type { ApiClients } from '@/services/api/apiClients';
import { ApiClientsProvider } from '@/services/api/ApiClientsProvider';
import { AppThemeProvider } from '@/theme/ThemeProvider';

interface AppProvidersProps extends PropsWithChildren {
  readonly apiClients?: ApiClients;
  readonly queryClient?: QueryClient;
}

export const AppProviders = ({
  apiClients: providedApiClients,
  children,
  queryClient: providedQueryClient,
}: AppProvidersProps) => {
  const [ownedQueryClient] = useState(createAppQueryClient);
  const queryClient = providedQueryClient ?? ownedQueryClient;
  const [apiClients] = useState(
    () => providedApiClients ?? createConfiguredApiClients(queryClient),
  );

  return (
    <AppThemeProvider>
      <ApplicationErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ApiClientsProvider clients={apiClients}>
            <SessionBootstrap>
              <TeamVisualThemeProvider>{children}</TeamVisualThemeProvider>
            </SessionBootstrap>
          </ApiClientsProvider>
        </QueryClientProvider>
      </ApplicationErrorBoundary>
    </AppThemeProvider>
  );
};
