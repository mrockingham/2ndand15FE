import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { SectionPage } from '@/pages/SectionPage';

export const appRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'games',
        element: (
          <SectionPage
            eyebrow="GAME DAY"
            title="Games"
            description="Schedules, live context, scores, and the game center will come together here."
          />
        ),
      },
      {
        path: 'news',
        element: (
          <SectionPage
            eyebrow="AROUND THE LEAGUE"
            title="News"
            description="Attributed reporting and clearly labeled AI summaries will live here."
          />
        ),
      },
      {
        path: 'stats',
        element: (
          <SectionPage
            eyebrow="BEYOND THE BOX SCORE"
            title="Stats"
            description="Team, player, and league performance tools are planned for a later milestone."
          />
        ),
      },
      {
        path: 'ai',
        element: (
          <SectionPage
            eyebrow="RESPONSIBLE INTELLIGENCE"
            title="AI Hub"
            description="Transparent predictions and decision support will be built here with confidence and provenance."
          />
        ),
      },
      {
        path: 'fantasy',
        element: (
          <SectionPage
            eyebrow="YOUR WEEK, SHARPER"
            title="Fantasy"
            description="Start/sit, waiver, and trade tools will arrive after their backend contracts are ready."
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
