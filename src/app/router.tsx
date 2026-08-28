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
const LazyContactPage = lazy(async () => ({
  default: (await import('@/pages/ContactPage')).ContactPage,
}));
const LazyGamesPage = lazy(async () => ({
  default: (await import('@/pages/GamesPage')).GamesPage,
}));
const LazyGameDetailPage = lazy(async () => ({
  default: (await import('@/pages/GameDetailPage')).GameDetailPage,
}));
const LazyArticleDetailPage = lazy(async () => ({
  default: (await import('@/pages/ArticleDetailPage')).ArticleDetailPage,
}));
const LazyPlayersPage = lazy(async () => ({
  default: (await import('@/pages/PlayersPage')).PlayersPage,
}));
const LazyPlayerDetailPage = lazy(async () => ({
  default: (await import('@/pages/PlayerDetailPage')).PlayerDetailPage,
}));
const LazyPlayerComparePage = lazy(async () => ({
  default: (await import('@/pages/PlayerComparePage')).PlayerComparePage,
}));
const LazyStatsPage = lazy(async () => ({
  default: (await import('@/pages/StatsPage')).StatsPage,
}));
const LazyTeamsPage = lazy(async () => ({
  default: (await import('@/pages/TeamsPage')).TeamsPage,
}));
const LazyTeamHubPage = lazy(async () => ({
  default: (await import('@/pages/TeamHubPage')).TeamHubPage,
}));
const LazyAiHubPage = lazy(async () => ({
  default: (await import('@/pages/AiHubPage')).AiHubPage,
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
const LazyAdminDataHealthPage = lazy(async () => ({
  default: (await import('@/pages/AdminDataHealthPage')).AdminDataHealthPage,
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
const LazyAdminNewsSourcesPage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsSourcesPage')).AdminNewsSourcesPage,
}));
const LazyAdminNewsSourceCreatePage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsSourceCreatePage'))
    .AdminNewsSourceCreatePage,
}));
const LazyAdminNewsSourceDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsSourceDetailPage'))
    .AdminNewsSourceDetailPage,
}));
const LazyAdminNewsCandidatesPage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsCandidatesPage'))
    .AdminNewsCandidatesPage,
}));
const LazyAdminNewsCandidateManualPage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsCandidateManualPage'))
    .AdminNewsCandidateManualPage,
}));
const LazyAdminNewsCandidateDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminNewsCandidateDetailPage'))
    .AdminNewsCandidateDetailPage,
}));
const LazyAdminGameMediaPage = lazy(async () => ({
  default: (await import('@/pages/AdminGameMediaPage')).AdminGameMediaPage,
}));
const LazyAdminGameMediaDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminGameMediaDetailPage'))
    .AdminGameMediaDetailPage,
}));
const LazyAdminHomepagePage = lazy(async () => ({
  default: (await import('@/pages/AdminHomepagePage')).AdminHomepagePage,
}));
const LazyAdminTeamHomepagesPage = lazy(async () => ({
  default: (await import('@/pages/AdminTeamHomepagesPage'))
    .AdminTeamHomepagesPage,
}));
const LazyAdminHeroSlideEditorPage = lazy(async () => ({
  default: (await import('@/pages/AdminHeroSlideEditorPage'))
    .AdminHeroSlideEditorPage,
}));
const LazyAdminContactMessagesPage = lazy(async () => ({
  default: (await import('@/pages/AdminContactMessagesPage'))
    .AdminContactMessagesPage,
}));
const LazyAdminContactMessageDetailPage = lazy(async () => ({
  default: (await import('@/pages/AdminContactMessageDetailPage'))
    .AdminContactMessageDetailPage,
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
      { path: 'games', element: deferred(<LazyGamesPage />) },
      { path: 'games/:gameId', element: deferred(<LazyGameDetailPage />) },
      { path: 'news', element: deferred(<LazyNewsPage />) },
      { path: 'news/:slug', element: deferred(<LazyArticleDetailPage />) },
      { path: 'contact', element: deferred(<LazyContactPage />) },
      { path: 'players', element: deferred(<LazyPlayersPage />) },
      { path: 'players/compare', element: deferred(<LazyPlayerComparePage />) },
      {
        path: 'players/:playerId',
        element: deferred(<LazyPlayerDetailPage />),
      },
      { path: 'stats', element: deferred(<LazyStatsPage />) },
      { path: 'teams', element: deferred(<LazyTeamsPage />) },
      { path: 'teams/:teamId', element: deferred(<LazyTeamHubPage />) },
      {
        path: 'ai',
        element: deferred(<LazyAiHubPage />),
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
              {
                path: 'homepage',
                element: deferred(<LazyAdminHomepagePage />),
              },
              {
                path: 'team-homepages',
                element: deferred(<LazyAdminTeamHomepagesPage />),
              },
              {
                path: 'homepage/hero/new',
                element: deferred(<LazyAdminHeroSlideEditorPage />),
              },
              {
                path: 'homepage/hero/:slideId',
                element: deferred(<LazyAdminHeroSlideEditorPage />),
              },
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
                path: 'news-sources',
                element: deferred(<LazyAdminNewsSourcesPage />),
              },
              {
                path: 'news-sources/new',
                element: deferred(<LazyAdminNewsSourceCreatePage />),
              },
              {
                path: 'news-sources/:sourceId',
                element: deferred(<LazyAdminNewsSourceDetailPage />),
              },
              {
                path: 'news-candidates',
                element: deferred(<LazyAdminNewsCandidatesPage />),
              },
              {
                path: 'news-candidates/manual',
                element: deferred(<LazyAdminNewsCandidateManualPage />),
              },
              {
                path: 'news-candidates/:candidateId',
                element: deferred(<LazyAdminNewsCandidateDetailPage />),
              },
              {
                path: 'data-health',
                element: deferred(<LazyAdminDataHealthPage />),
              },
              {
                path: 'game-media',
                element: deferred(<LazyAdminGameMediaPage />),
              },
              {
                path: 'game-media/:gameId',
                element: deferred(<LazyAdminGameMediaDetailPage />),
              },
              {
                path: 'contact-messages',
                element: deferred(<LazyAdminContactMessagesPage />),
              },
              {
                path: 'contact-messages/:messageId',
                element: deferred(<LazyAdminContactMessageDetailPage />),
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
