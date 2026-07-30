import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { appRouter } from '@/app/router';

export const App = () => (
  <AppProviders>
    <RouterProvider router={appRouter} />
  </AppProviders>
);
