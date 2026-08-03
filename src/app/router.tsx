/* eslint-disable react-refresh/only-export-components -- route configuration owns lazy route components and exported router data. */
import { lazy, Suspense, type ReactNode } from 'react';
import { RouteLoading } from '@/app/RouteLoading';
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';

import {
  PublicOnlyAuthentication,
  RequireAdministrativeRole,
  RequireAuthentication,
} from '@/features/auth/components/routeGuards';
import { AppLayout } from '@/layouts/AppLayout';
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

const LazyAdminLayout = lazy(async () => ({
  default: (await import('@/layouts/AdminLayout')).AdminLayout,
}));
const LazyNewsPage = lazy(async () => ({
  default: (await import('@/pages/NewsPage')).NewsPage,
}));
const LazyArticleDetailPage = lazy(async () => ({
  default: (await import('@/pages/ArticleDetailPage')).ArticleDetailPage,
}));
const LazyAdminGamesPage = lazy(async () => ({
  default: (await import('@/pages/AdminGamesPage')).AdminGamesPage,
}));
const LazyAdminGameCreatePage = lazy(async () => ({
  default: (await import('@/pages/AdminGameCreatePage')).AdminGameCreatePage,
}));
const LazyAdminGameDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminGameDetailPage')).AdminGameDetailPage,
}));
const LazyAdminImportPage = lazy(async () => ({
  default: (await import('@/pages/AdminImportPage')).AdminImportPage,
}));
const LazyAdminAuditPage = lazy(async () => ({
  default: (await import('@/pages/AdminAuditPage')).AdminAuditPage,
}));
const LazyAdminArticlesPage = lazy(async () => ({
  default: (await import('@/pages/AdminArticlesPage')).AdminArticlesPage,
}));
const LazyAdminArticleCreatePage = lazy(async () => ({
  default: (await import('@/pages/AdminArticleCreatePage'))
    .AdminArticleCreatePage,
}));
const LazyAdminArticleDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminArticleDetailPage'))
    .AdminArticleDetailPage,
}));

const deferred = (element: ReactNode) => (
  <Suspense fallback={<RouteLoading />}>{element}</Suspense>
);

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
      { path: 'news', element: deferred(<LazyNewsPage />) },
      { path: 'news/:slug', element: deferred(<LazyArticleDetailPage />) },
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
            element: deferred(<LazyAdminLayout />),
            children: [
              { index: true, element: <Navigate to="games" replace /> },
              { path: 'games', element: deferred(<LazyAdminGamesPage />) },
              {
                path: 'games/new',
                element: deferred(<LazyAdminGameCreatePage />),
              },
              {
                path: 'games/:gameId',
                element: deferred(<LazyAdminGameDetailPage />),
              },
              { path: 'import', element: deferred(<LazyAdminImportPage />) },
              {
                path: 'articles',
                element: deferred(<LazyAdminArticlesPage />),
              },
              {
                path: 'articles/new',
                element: deferred(<LazyAdminArticleCreatePage />),
              },
              {
                path: 'articles/:articleId',
                element: deferred(<LazyAdminArticleDetailPage />),
              },
              {
                element: <RequireAdministrativeRole adminOnly />,
                children: [
                  { path: 'audit', element: deferred(<LazyAdminAuditPage />) },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
