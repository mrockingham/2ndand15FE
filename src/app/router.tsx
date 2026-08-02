import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import {
  PublicOnlyAuthentication,
  RequireAdministrativeRole,
  RequireAuthentication,
} from '@/features/auth/components/routeGuards';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminAuditPage } from '@/pages/AdminAuditPage';
import { AdminGameCreatePage } from '@/pages/AdminGameCreatePage';
import { AdminGameDetailPage } from '@/pages/AdminGameDetailPage';
import { AdminGamesPage } from '@/pages/AdminGamesPage';
import { AdminImportPage } from '@/pages/AdminImportPage';
import { AccountPage } from '@/pages/AccountPage';
import { ChooseTeamPage } from '@/pages/ChooseTeamPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
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
      {
        element: <PublicOnlyAuthentication />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      {
        element: <RequireAuthentication />,
        children: [
          { path: 'account', element: <AccountPage /> },
          { path: 'choose-team', element: <ChooseTeamPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <RequireAuthentication />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RequireAdministrativeRole />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="games" replace /> },
              { path: 'games', element: <AdminGamesPage /> },
              { path: 'games/new', element: <AdminGameCreatePage /> },
              { path: 'games/:gameId', element: <AdminGameDetailPage /> },
              { path: 'import', element: <AdminImportPage /> },
              {
                element: <RequireAdministrativeRole adminOnly />,
                children: [{ path: 'audit', element: <AdminAuditPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
