import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { appRoutes } from '@/app/router';

export const renderApp = (initialRoute = '/') => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialRoute],
  });

  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
};
