import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useThemePreferences } from '@/stores/themePreferences';
import {
  modelPerformanceFixture,
  predictionFixtures,
  weeklyInsightsFixture,
} from '@/test/aiHubFixtures';
import {
  apiErrorResponse,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

type FailedQuery = 'weekly' | 'predictions' | 'performance';

const aiHubRequestRouter = ({
  failures = [],
  insights = weeklyInsightsFixture,
  predictions = predictionFixtures.slice(0, 2),
}: {
  readonly failures?: readonly FailedQuery[];
  readonly insights?: typeof weeklyInsightsFixture;
  readonly predictions?: typeof predictionFixtures;
} = {}) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/ai-hub/weekly-insights'))
      return Promise.resolve(
        failures.includes('weekly')
          ? apiErrorResponse('AI_INSIGHTS_UNAVAILABLE', 'Unavailable', 404)
          : jsonResponse({ data: insights }),
      );
    if (url.pathname.endsWith('/ai-hub/predictions'))
      return Promise.resolve(
        failures.includes('predictions')
          ? apiErrorResponse('PREDICTIONS_UNAVAILABLE', 'Unavailable', 404)
          : jsonResponse({ data: predictions }),
      );
    if (url.pathname.endsWith('/ai-hub/performance'))
      return Promise.resolve(
        failures.includes('performance')
          ? apiErrorResponse('PERFORMANCE_UNAVAILABLE', 'Unavailable', 404)
          : jsonResponse({ data: modelPerformanceFixture }),
      );
    return Promise.reject(
      new TypeError(`Unexpected request: ${url.toString()}`),
    );
  });

describe('AI Hub featured matchup', () => {
  it('features the signed-in favorite team with honest matchup output', async () => {
    const fetchImplementation = aiHubRequestRouter();
    renderApp('/ai', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    const title = await screen.findByRole('heading', {
      name: /BUF matchup spotlight/i,
    });
    const featured = title.closest('section')!;
    expect(within(featured).getByText('78.5%')).toBeInTheDocument();
    expect(within(featured).getByText('21.5%')).toBeInTheDocument();
    expect(within(featured).getByText('26 – 21')).toBeInTheDocument();
    expect(within(featured).getByText('LOW confidence')).toBeInTheDocument();
    expect(within(featured).getAllByText('Buffalo Bills')).toHaveLength(2);
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes(
          `teamId=${userWithFavoriteFixture.favoriteTeam!.id}`,
        ),
      ),
    ).toBe(true);
  });

  it('uses the closest matchup without implying personalization for a visitor', async () => {
    renderApp('/ai', { fetchImplementation: aiHubRequestRouter() });

    const title = await screen.findByRole('heading', {
      name: /closest game this week/i,
    });
    const featured = title.closest('section')!;
    expect(within(featured).getByText('48.7%')).toBeInTheDocument();
    expect(within(featured).getByText('51.3%')).toBeInTheDocument();
    expect(screen.queryByText(/matchup spotlight/i)).not.toBeInTheDocument();
  });

  it('falls back to a general matchup when the favorite has no weekly prediction', async () => {
    renderApp('/ai', {
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
      fetchImplementation: aiHubRequestRouter({
        insights: { ...weeklyInsightsFixture, favoriteTeamPrediction: null },
      }),
    });

    expect(
      await screen.findByText(/favorite team has no reviewed prediction/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /closest game this week/i }),
    ).toBeInTheDocument();
  });

  it('shows an already-published explanation without generating one', async () => {
    const explainedPrediction = {
      ...predictionFixtures[0]!,
      game: {
        ...predictionFixtures[0]!.game,
        id: weeklyInsightsFixture.favoriteTeamPrediction!.game.id,
      },
      explanation: {
        summary: 'A reviewed explanation already stored with this prediction.',
        keyReasons: ['Historical evidence supports the model lean.'],
        watchFor: [],
      },
    };
    renderApp('/ai', {
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
      fetchImplementation: aiHubRequestRouter({
        predictions: [explainedPrediction],
      }),
    });

    expect(
      await screen.findByText(/reviewed explanation already stored/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Published model explanation')).toBeInTheDocument();
  });
});

describe('AI Hub supported intelligence', () => {
  it('renders weekly signals, all three safe edges, and five LOW-confidence rankings', async () => {
    renderApp('/ai', { fetchImplementation: aiHubRequestRouter() });

    expect(await screen.findByText('Strongest pick')).toBeInTheDocument();
    for (const label of [
      'Closest matchup',
      'Upset watch',
      'Most likely blowout',
      'Highest projected total',
      'Lowest projected total',
      'Offensive edge',
      'Defensive edge',
      'Turnover profile edge',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('57 points')).toBeInTheDocument();
    expect(screen.getByText('38 points')).toBeInTheDocument();
    expect(screen.getByText(/Passing Production/)).toBeInTheDocument();
    const ranking = screen
      .getByRole('heading', { name: /strongest picks this week/i })
      .closest('section')!;
    expect(within(ranking).getAllByText('LOW confidence')).toHaveLength(5);
  });

  it('renders all 16 reviewed prediction cards with team orientation and real links', async () => {
    renderApp('/ai', {
      fetchImplementation: aiHubRequestRouter({
        predictions: predictionFixtures,
      }),
    });

    const heading = await screen.findByRole('heading', {
      name: /all weekly predictions/i,
    });
    const grid = heading.closest('section')!;
    expect(within(grid).getByText('16 games')).toBeInTheDocument();
    expect(
      within(grid).getAllByRole('link', { name: 'Game Center' }),
    ).toHaveLength(16);
    expect(within(grid).getAllByText('55%')).toHaveLength(16);
    expect(within(grid).getAllByText('45%')).toHaveLength(16);
  });

  it('shows an intentional zero-evaluation state with null rates', async () => {
    renderApp('/ai', { fetchImplementation: aiHubRequestRouter() });

    const heading = await screen.findByRole('heading', {
      name: /2nd & 15 model performance/i,
    });
    const panel = heading.closest('section')!;
    expect(within(panel).getByText('0–0')).toBeInTheDocument();
    expect(within(panel).getAllByText('—')).toHaveLength(2);
    expect(
      within(panel).getByText(/no published predictions have been evaluated/i),
    ).toBeInTheDocument();
  });

  it('does not expose unsupported mockup features or official image assets', async () => {
    renderApp('/ai', { fetchImplementation: aiHubRequestRouter() });
    await screen.findByRole('heading', { name: /weekly intelligence/i });

    for (const text of [
      /player projections/i,
      /injury impact/i,
      /lineup optimizer/i,
      /start\/sit/i,
      /ask anything/i,
      /fantasy projections/i,
    ]) {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
    expect(document.querySelector('img')).toBeNull();
    expect(
      document.querySelectorAll('[data-team-helmet]').length,
    ).toBeGreaterThan(0);
  });
});

describe('AI Hub resilient states and controls', () => {
  it('keeps the prediction grid and performance available if weekly insights fail', async () => {
    renderApp('/ai', {
      fetchImplementation: aiHubRequestRouter({ failures: ['weekly'] }),
    });
    expect(
      await screen.findByText(
        /weekly intelligence is temporarily unavailable/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /all weekly predictions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/model performance is temporarily unavailable/i),
    ).toBeInTheDocument();
  });

  it('keeps weekly intelligence and performance available if prediction cards fail', async () => {
    renderApp('/ai', {
      fetchImplementation: aiHubRequestRouter({ failures: ['predictions'] }),
    });
    expect(
      await screen.findByText(/prediction cards are temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /weekly intelligence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /2nd & 15 model performance/i }),
    ).toBeInTheDocument();
  });

  it('normalizes the URL and requests a newly selected context', async () => {
    const user = userEvent.setup();
    const fetchImplementation = aiHubRequestRouter();
    const { router } = renderApp('/ai?type=INVALID&week=99', {
      fetchImplementation,
    });

    await screen.findByRole('heading', { name: /weekly intelligence/i });
    await waitFor(() =>
      expect(router.state.location.search).toBe('?season=2026&type=PRE&week=1'),
    );
    await user.click(screen.getByLabelText('Season type'));
    await user.click(screen.getByRole('option', { name: 'Regular Season' }));
    await waitFor(() =>
      expect(router.state.location.search).toContain('type=REG'),
    );
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('seasonType=REG'),
      ),
    ).toBe(true);
  });

  it.each(['dark', 'light'] as const)(
    'uses one responsive tree in %s mode',
    async (mode) => {
      useThemePreferences.setState({ mode });
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 390,
      });
      window.dispatchEvent(new Event('resize'));
      renderApp('/ai', {
        currentUser: userWithFavoriteFixture,
        restorationStatus: 'authenticated',
        fetchImplementation: aiHubRequestRouter(),
      });
      expect(
        await screen.findByRole('heading', { name: /weekly intelligence/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /matchup edges/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /all weekly predictions/i }),
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
});
