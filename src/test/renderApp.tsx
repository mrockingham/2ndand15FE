import { render } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { createAppQueryClient } from '@/app/queryClient';
import { appRoutes } from '@/app/router';
import { userKeys } from '@/features/users/queryKeys';
import type { CurrentUser } from '@/features/users/types';
import { createAuthApiClients } from '@/features/auth/createAuthApiClients';
import type { RestorationStatus } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { currentUserFixture } from '@/test/authFixtures';

type TestInitialEntry =
  | string
  | {
      readonly pathname: string;
      readonly search?: string;
      readonly state?: unknown;
    };

interface RenderAppOptions {
  readonly accessToken?: string | null;
  readonly currentUser?: CurrentUser | null;
  readonly fetchImplementation?: typeof fetch;
  readonly queryClient?: QueryClient;
  readonly restorationStatus?: RestorationStatus;
}

export const renderApp = (
  initialRoute: TestInitialEntry = '/',
  options: RenderAppOptions = {},
) => {
  const restorationStatus = options.restorationStatus ?? 'anonymous';
  const accessToken =
    options.accessToken ??
    (restorationStatus === 'authenticated' ? 'test-access-token' : null);
  useAuthStore.setState({
    accessToken,
    accessTokenExpiresAt: accessToken === null ? null : Date.now() + 900_000,
    restorationStatus,
  });

  const queryClient = options.queryClient ?? createAppQueryClient();
  const currentUser =
    options.currentUser === undefined && restorationStatus === 'authenticated'
      ? currentUserFixture
      : options.currentUser;
  if (currentUser !== null && currentUser !== undefined) {
    queryClient.setQueryData(userKeys.me, currentUser);
  }
  const fetchImplementation =
    options.fetchImplementation ??
    vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('Unexpected test request'));
  const apiClients = createAuthApiClients({
    baseUrl: 'http://localhost:3000/api/v1',
    fetchImplementation,
    queryClient,
  });
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialRoute],
  });

  return {
    router,
    apiClients,
    queryClient,
    ...render(
      <AppProviders apiClients={apiClients} queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
};
