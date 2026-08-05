import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  billsFixture,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import {
  playerAttributionFixture,
  quarterbackFixture,
} from '@/test/playerFixtures';
import {
  recentPerformanceFixture,
  seasonLeaderFixture,
  statsMetadataFixture,
  weeklyLeaderFixture,
} from '@/test/statsHubFixtures';
import { renderApp } from '@/test/renderApp';

const metadataResponse = () =>
  jsonResponse({
    data: statsMetadataFixture,
    meta: { attribution: playerAttributionFixture },
  });

const leaderboardResponse = (
  data: readonly unknown[],
  nextCursor: string | null = null,
) =>
  jsonResponse({
    data,
    meta: {
      nextCursor,
      metric: statsMetadataFixture.metrics[0],
      ranking: { method: 'COMPETITION', tiedValuesShareRank: true },
      attribution: playerAttributionFixture,
    },
  });

const statsFetch = (options: { readonly nextCursor?: string | null } = {}) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/stats/metadata'))
      return Promise.resolve(metadataResponse());
    if (url.pathname.endsWith('/teams'))
      return Promise.resolve(jsonResponse({ data: [billsFixture] }));
    if (url.pathname.endsWith('/stats/leaders'))
      return Promise.resolve(
        leaderboardResponse([seasonLeaderFixture], options.nextCursor ?? null),
      );
    if (url.pathname.endsWith('/stats/weekly-leaders'))
      return Promise.resolve(leaderboardResponse([weeklyLeaderFixture]));
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });

describe('public Stats Hub page', () => {
  it('lazy-loads metadata first, normalizes the URL, and renders backend-ranked season data', async () => {
    const fetchImplementation = statsFetch();
    const { router } = renderApp(
      '/stats?season=2099&position=rb&privateField=secret',
      {
        fetchImplementation,
      },
    );

    expect(screen.getByRole('status')).toHaveTextContent(/Loading page/);
    expect(
      await screen.findByRole('heading', { name: 'Stats' }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText('Alex Quarterback')).not.toHaveLength(0);
    expect(screen.getAllByText('4,500').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('Multiple teams (BUF, PHI)').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Rank 1').length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: /Alex Quarterback/ })[0],
    ).toHaveAttribute('href', `/players/${quarterbackFixture.id}`);
    expect(
      screen.getByText(statsMetadataFixture.coverageNotes[0]),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Passing' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Defense' })).toBeInTheDocument();
    expect(screen.queryByText(/privateField/i)).not.toBeInTheDocument();

    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(Object.fromEntries(search)).toMatchObject({
        view: 'season',
        season: '2025',
        type: 'REG',
        category: 'PASSING',
        metric: 'passing_yards',
      });
      expect(search.has('position')).toBe(false);
      expect(search.has('privateField')).toBe(false);
    });
    const calls = fetchImplementation.mock.calls.map((call) => String(call[0]));
    expect(
      calls.findIndex((url) => url.includes('/stats/metadata')),
    ).toBeLessThan(calls.findIndex((url) => url.includes('/stats/leaders?')));
  });

  it('renders weekly rows as separate game-linked performances and never sends REG_POST', async () => {
    const fetchImplementation = statsFetch();
    renderApp(
      '/stats?view=week&season=2025&type=REG_POST&week=10&category=PASSING&metric=passing_yards',
      {
        fetchImplementation,
      },
    );

    expect(await screen.findAllByText('BUF vs PHI')).not.toHaveLength(0);
    expect(
      screen.getAllByRole('link', { name: 'BUF vs PHI' })[0],
    ).toHaveAttribute('href', `/games/${weeklyLeaderFixture.gameId}`);
    await waitFor(() => {
      const call = fetchImplementation.mock.calls.find((entry) =>
        String(entry[0]).includes('/stats/weekly-leaders?'),
      );
      expect(String(call?.[0])).toContain('week=10');
      expect(String(call?.[0])).toContain('seasonType=REG');
      expect(String(call?.[0])).not.toContain('REG_POST');
    });
  });

  it('changes category to the first metadata-supported metric and shares filter state', async () => {
    const fetchImplementation = statsFetch();
    const { router } = renderApp('/stats', { fetchImplementation });
    await screen.findAllByText('Alex Quarterback');

    await userEvent.click(screen.getByRole('tab', { name: 'Defense' }));
    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('category')).toBe('DEFENSE');
      expect(search.get('metric')).toBe('sacks');
    });
    expect(
      screen.getByText(statsMetadataFixture.metrics[1].description),
    ).toBeInTheDocument();
  });

  it('offers a favorite-team shortcut without hiding league results by default', async () => {
    const fetchImplementation = statsFetch();
    const { router } = renderApp('/stats', {
      restorationStatus: 'authenticated',
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
    });
    const shortcut = await screen.findByRole('button', {
      name: /Show My Team: BUF/,
    });
    expect(
      new URLSearchParams(router.state.location.search).has('teamId'),
    ).toBe(false);
    await userEvent.click(shortcut);
    expect(
      new URLSearchParams(router.state.location.search).get('teamId'),
    ).toBe(billsFixture.id);
    await waitFor(() => {
      expect(
        fetchImplementation.mock.calls.some((call) =>
          String(call[0]).includes(`teamId=${billsFixture.id}`),
        ),
      ).toBe(true);
    });
  });

  it('passes opaque cursors unchanged and preserves backend rank continuity', async () => {
    const secondRow = { ...seasonLeaderFixture, rank: 4, metricValue: 0 };
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/stats/metadata'))
        return Promise.resolve(metadataResponse());
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(jsonResponse({ data: [billsFixture] }));
      if (url.pathname.endsWith('/stats/leaders'))
        return Promise.resolve(
          url.searchParams.get('cursor') === 'opaque.value'
            ? leaderboardResponse([secondRow])
            : leaderboardResponse([seasonLeaderFixture], 'opaque.value'),
        );
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    renderApp('/stats', { fetchImplementation });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Load more leaders' }),
    );

    expect((await screen.findAllByLabelText('Rank 4')).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(
      fetchImplementation.mock.calls.some((call) =>
        String(call[0]).includes('cursor=opaque.value'),
      ),
    ).toBe(true);
  });

  it('shows server aggregates and chronological recent appearances without turning null into zero', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/stats/metadata'))
        return Promise.resolve(metadataResponse());
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(jsonResponse({ data: [billsFixture] }));
      if (url.pathname.endsWith('/stats/leaders'))
        return Promise.resolve(leaderboardResponse([]));
      if (url.pathname.endsWith(`/players/${quarterbackFixture.id}`))
        return Promise.resolve(
          jsonResponse({
            data: quarterbackFixture,
            meta: { attribution: playerAttributionFixture },
          }),
        );
      if (url.pathname.endsWith('/stats/recent'))
        return Promise.resolve(
          jsonResponse({
            data: {
              player: recentPerformanceFixture.player,
              performances: recentPerformanceFixture.performances,
              summary: recentPerformanceFixture.summary,
            },
            meta: {
              metric: recentPerformanceFixture.metric,
              attribution: playerAttributionFixture,
            },
          }),
        );
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    renderApp(`/stats?recentPlayerId=${quarterbackFixture.id}&recentGames=10`, {
      fetchImplementation,
    });

    const summary = await screen.findByLabelText('Recent performance summary');
    expect(within(summary).getByText('Missing values')).toBeInTheDocument();
    expect(within(summary).getAllByText('1')).toHaveLength(2);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    const gameLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/games/'));
    expect(gameLinks.length).toBe(2);
    expect(document.body).not.toHaveTextContent(
      /hot|cold|momentum|improvement|decline/i,
    );
    expect(
      fetchImplementation.mock.calls.some(
        (call) =>
          String(call[0]).includes('/stats/recent?') &&
          String(call[0]).includes('games=10'),
      ),
    ).toBe(true);
  });

  it('shows a retryable metadata error without requesting a leaderboard', async () => {
    let metadataAttempts = 0;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/stats/metadata')) {
        metadataAttempts += 1;
        return Promise.resolve(
          metadataAttempts === 1
            ? jsonResponse(
                { error: { code: 'VALIDATION_ERROR', message: 'bad' } },
                400,
              )
            : metadataResponse(),
        );
      }
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(jsonResponse({ data: [] }));
      if (url.pathname.endsWith('/stats/leaders'))
        return Promise.resolve(leaderboardResponse([]));
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    renderApp('/stats', { fetchImplementation });

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByRole('heading', { name: 'Stats' }),
    ).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.filter((call) =>
        String(call[0]).includes('/stats/leaders'),
      ),
    ).toHaveLength(1);
    expect(
      fetchImplementation.mock.calls.findIndex((call) =>
        String(call[0]).includes('/stats/leaders'),
      ),
    ).toBeGreaterThan(
      fetchImplementation.mock.calls.findIndex((call) =>
        String(call[0]).includes('/stats/metadata'),
      ),
    );
    expect(metadataAttempts).toBe(2);
  });
});
