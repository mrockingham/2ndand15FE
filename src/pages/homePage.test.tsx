import { screen, waitFor, within } from '@testing-library/react';

import { useThemePreferences } from '@/stores/themePreferences';
import { weeklyInsightsFixture } from '@/test/aiHubFixtures';
import {
  apiErrorResponse,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import {
  hallOfFameGameFixture,
  preseasonWeekOneFixture,
} from '@/test/gameFixtures';
import {
  emptyHomepageInsightsFixture,
  publicHomepageFixture,
} from '@/test/homepageFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import { renderApp } from '@/test/renderApp';
import {
  seasonLeaderFixture,
  statsMetadataFixture,
} from '@/test/statsHubFixtures';
import { teamHubOverviewFixture } from '@/test/teamHubFixtures';

type FailureArea = 'ai' | 'hub' | 'news';

const homeRequestRouter = ({
  failures = [],
  insights = weeklyInsightsFixture,
  homepage = publicHomepageFixture,
}: {
  readonly failures?: readonly FailureArea[];
  readonly insights?: typeof weeklyInsightsFixture;
  readonly homepage?: typeof publicHomepageFixture;
} = {}) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/homepage'))
      return Promise.resolve(jsonResponse({ data: homepage }));
    if (url.pathname.endsWith(`/games/${hallOfFameGameFixture.id}`))
      return Promise.resolve(jsonResponse({ data: hallOfFameGameFixture }));
    if (url.pathname.endsWith('/games'))
      return Promise.resolve(
        jsonResponse({
          data: [hallOfFameGameFixture, preseasonWeekOneFixture],
          meta: { nextCursor: null },
        }),
      );
    if (url.pathname.endsWith('/articles/featured'))
      return failures.includes('news')
        ? Promise.resolve(apiErrorResponse('NOT_FOUND', 'Unavailable', 404))
        : Promise.resolve(
            jsonResponse({
              data: teamHubOverviewFixture.news.articles,
              meta: { nextCursor: null },
            }),
          );
    if (url.pathname.endsWith('/ai-hub/weekly-insights'))
      return failures.includes('ai')
        ? Promise.resolve(apiErrorResponse('NOT_FOUND', 'Unavailable', 404))
        : Promise.resolve(jsonResponse({ data: insights }));
    if (
      url.pathname.endsWith(
        `/teams/${userWithFavoriteFixture.favoriteTeam!.id}/hub`,
      )
    )
      return failures.includes('hub')
        ? Promise.resolve(
            apiErrorResponse('TEAM_UNAVAILABLE', 'Unavailable', 404),
          )
        : Promise.resolve(
            jsonResponse({
              data: teamHubOverviewFixture,
              meta: { attribution: playerAttributionFixture },
            }),
          );
    if (url.pathname.endsWith('/stats/metadata'))
      return Promise.resolve(
        jsonResponse({
          data: statsMetadataFixture,
          meta: { attribution: playerAttributionFixture },
        }),
      );
    if (
      url.pathname.endsWith('/stats/leaders') ||
      url.pathname.endsWith('/stat-leaders')
    )
      return Promise.resolve(
        jsonResponse({
          data: [seasonLeaderFixture],
          meta: {
            nextCursor: null,
            metric: statsMetadataFixture.metrics[0],
            attribution: playerAttributionFixture,
          },
        }),
      );
    return Promise.reject(
      new TypeError(`Unexpected request: ${url.toString()}`),
    );
  });

describe('Home page states', () => {
  it('renders the visitor event hero and independent public content without a team hub request', async () => {
    const fetchImplementation = homeRequestRouter();
    renderApp('/', { fetchImplementation });

    expect(
      screen.getByRole('img', {
        name: /hall of fame game promotion featuring the carolina panthers and arizona cardinals/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /your front row to football/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /sign in/i })[0],
    ).toHaveAttribute('href', '/login');

    expect(
      await screen.findByText(/Final · CAR 33–30 ARI/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /recent & upcoming games/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /top stories/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
    const newsAndInsights = screen.getByRole('complementary', {
      name: /homepage news and insights/i,
    });
    const topStories = screen.getByRole('region', {
      name: /^top stories$/i,
    });
    expect(
      within(topStories).getByRole('heading', { name: /^top stories$/i }),
    ).toBeInTheDocument();
    expect(newsAndInsights).not.toContainElement(topStories);
    expect(
      within(newsAndInsights).getByRole('heading', {
        name: /AI Hub snapshot/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /league leaders/i }),
    ).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('/hub'),
      ),
    ).toBe(false);
  });

  it('renders a hybrid signed-in state with no favorite and never invents team content', async () => {
    const fetchImplementation = homeRequestRouter();
    renderApp('/', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    expect(
      screen.getByRole('heading', {
        name: /choose your team. make home yours/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /choose your team/i })[0],
    ).toHaveAttribute('href', '/choose-team');
    expect(screen.queryByText('Buffalo Bills')).not.toBeInTheDocument();
    await screen.findByRole('heading', { name: /AI Hub snapshot/i });
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('/hub'),
      ),
    ).toBe(false);
  });

  it('renders the complete favorite-team Home with honest historical and LOW-confidence labels', async () => {
    const fetchImplementation = homeRequestRouter();
    renderApp('/', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    expect(
      screen.getByRole('heading', { name: 'Buffalo Bills' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /open team hub/i }),
    ).toHaveAttribute(
      'href',
      `/teams/${userWithFavoriteFixture.favoriteTeam!.id}`,
    );
    expect(
      await screen.findByRole('heading', { name: /regular season week 16/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /2nd & 15 prediction/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Model confidence: LOW')).toBeInTheDocument();
    expect(screen.getByText('Model favors BUF')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /Bills news/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /2025 Team Leaders/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not a current 2026 roster/i)).toBeInTheDocument();

    const performance = screen
      .getByRole('heading', {
        name: /2nd & 15 model performance/i,
      })
      .closest('section');
    expect(performance).not.toBeNull();
    expect(within(performance!).getByText('0–0')).toBeInTheDocument();
    expect(within(performance!).getAllByText('—')).toHaveLength(2);
    expect(
      fetchImplementation.mock.calls.filter(([input]) =>
        String(input).includes('/ai-hub/weekly-insights'),
      ),
    ).toHaveLength(1);
    expect(
      fetchImplementation.mock.calls.filter(([input]) =>
        String(input).includes('/hub'),
      ),
    ).toHaveLength(1);
  });

  it('states when the favorite team is the predicted loser', async () => {
    const insights = {
      ...weeklyInsightsFixture,
      favoriteTeamPrediction: {
        ...weeklyInsightsFixture.favoriteTeamPrediction!,
        teamWinProbability: 0.42,
        isPredictedWinner: false,
      },
    };
    renderApp('/', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation: homeRequestRouter({ insights }),
      restorationStatus: 'authenticated',
    });

    expect(await screen.findByText('Model favors PHI')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});

describe('Home section isolation and presentation', () => {
  it('keeps games and news available when the homepage has no published AI Hub insights', async () => {
    renderApp('/', {
      fetchImplementation: homeRequestRouter({
        homepage: {
          ...publicHomepageFixture,
          insights: emptyHomepageInsightsFixture,
        },
      }),
    });
    expect(
      await screen.findByText(/No published weekly insights are available/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Carolina Panthers').length).toBeGreaterThan(0);
    expect(
      screen.getByText(teamHubOverviewFixture.news.articles[0].title),
    ).toBeInTheDocument();
  });

  it('keeps AI Hub available when News fails', async () => {
    renderApp('/', {
      fetchImplementation: homeRequestRouter({ failures: ['news'] }),
    });
    expect(
      await screen.findByText(/News is temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText('LAR vs SEA').length).toBeGreaterThan(0);
  });

  it('isolates a Team Hub error from prediction and model performance', async () => {
    renderApp('/', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation: homeRequestRouter({ failures: ['hub'] }),
      restorationStatus: 'authenticated',
    });
    expect(
      await screen.findByText(/Your team matchup is temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Model confidence: LOW')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /2nd & 15 model performance/i }),
    ).toBeInTheDocument();
  });

  it.each(['dark', 'light'] as const)(
    'renders the favorite-team accent hierarchy in %s mode',
    async (mode) => {
      useThemePreferences.setState({ mode });
      renderApp('/', {
        currentUser: userWithFavoriteFixture,
        fetchImplementation: homeRequestRouter(),
        restorationStatus: 'authenticated',
      });
      expect(
        await screen.findByText('Model confidence: LOW'),
      ).toBeInTheDocument();
      expect(document.documentElement).toHaveAttribute(
        'data-color-scheme',
        mode,
      );
      expect(screen.getByTestId('team-visual-theme-root')).toHaveAttribute(
        'data-team-visual',
        'BUF',
      );
    },
  );

  it('keeps major personalized content available at a mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    window.dispatchEvent(new Event('resize'));
    renderApp('/', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation: homeRequestRouter(),
      restorationStatus: 'authenticated',
    });
    await waitFor(() =>
      expect(screen.getByText('Model confidence: LOW')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('heading', { name: 'Buffalo Bills' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Bills news/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
  });
});
