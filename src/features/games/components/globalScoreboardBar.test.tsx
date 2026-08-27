import { screen, waitFor, within } from '@testing-library/react';

import { billsFixture, userWithFavoriteFixture } from '@/test/authFixtures';
import {
  awayGameTeamFixture,
  gameFixture,
  homeGameTeamFixture,
} from '@/test/gameFixtures';
import { renderApp } from '@/test/renderApp';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const scoreboardFetch = (games: unknown[]) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/games'))
      return Promise.resolve(json({ data: games, meta: { nextCursor: null } }));
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });

const liveGame = {
  ...gameFixture,
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  status: 'IN_PROGRESS',
  startTime: new Date().toISOString(),
  awayScore: 17,
  homeScore: 20,
  quarter: 3,
  clock: '8:42',
};

const finalGame = {
  ...gameFixture,
  id: 'aaaaaaaa-0000-4000-8000-000000000002',
  status: 'FINAL',
  startTime: new Date().toISOString(),
  awayScore: 27,
  homeScore: 20,
};

const scheduledGame = {
  ...gameFixture,
  id: 'aaaaaaaa-0000-4000-8000-000000000003',
  status: 'SCHEDULED',
  startTime: new Date(Date.now() + 3 * 24 * 60 * 60_000).toISOString(),
  awayScore: null,
  homeScore: null,
};

const favoriteTeamGameTeam = {
  ...awayGameTeamFixture,
  id: billsFixture.id,
  abbreviation: billsFixture.abbreviation,
  fullName: billsFixture.fullName,
};

const favoriteTeamGame = {
  ...gameFixture,
  id: 'aaaaaaaa-0000-4000-8000-000000000004',
  status: 'SCHEDULED',
  startTime: new Date(Date.now() + 2 * 24 * 60 * 60_000).toISOString(),
  awayTeam: favoriteTeamGameTeam,
  homeTeam: homeGameTeamFixture,
  awayScore: null,
  homeScore: null,
};

const otherMatchupGame = {
  ...gameFixture,
  id: 'aaaaaaaa-0000-4000-8000-000000000005',
  status: 'SCHEDULED',
  startTime: new Date(Date.now() + 4 * 24 * 60 * 60_000).toISOString(),
  awayTeam: homeGameTeamFixture,
  homeTeam: awayGameTeamFixture,
  awayScore: null,
  homeScore: null,
};

describe('GlobalScoreboardBar', () => {
  it('renders a live game with score and clock but no fake data', async () => {
    renderApp('/', { fetchImplementation: scoreboardFetch([liveGame]) });

    const card = await screen.findByRole('link', {
      name: /buffalo bills 17, miami dolphins 20, live/i,
    });
    expect(within(card).getByText(/LIVE · Q3 · 8:42/)).toBeInTheDocument();
    expect(card).toHaveAttribute('href', `/games/${liveGame.id}`);
  });

  it('renders a final game with the winning score emphasized and no reordering surprises', async () => {
    renderApp('/', { fetchImplementation: scoreboardFetch([finalGame]) });

    const card = await screen.findByRole('link', {
      name: /buffalo bills 27, miami dolphins 20, final/i,
    });
    expect(within(card).getByText('FINAL')).toBeInTheDocument();
    expect(within(card).getByText('27')).toHaveAttribute('data-winner', 'true');
    expect(within(card).getByText('20')).not.toHaveAttribute('data-winner');
  });

  it('renders a scheduled game without a fabricated score', async () => {
    renderApp('/', { fetchImplementation: scoreboardFetch([scheduledGame]) });

    const card = await screen.findByRole('link', {
      name: /buffalo bills at miami dolphins/i,
    });
    expect(within(card).queryByText('0')).not.toBeInTheDocument();
  });

  it('emphasizes the authenticated user’s favorite team game', async () => {
    renderApp('/', {
      fetchImplementation: scoreboardFetch([
        favoriteTeamGame,
        otherMatchupGame,
      ]),
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
    });

    const favoriteCard = await screen.findByRole('link', {
      name: /buffalo bills at miami dolphins/i,
    });
    expect(favoriteCard).toHaveAttribute('data-favorite-team', 'true');
    const otherCard = screen.getByRole('link', {
      name: /miami dolphins at buffalo bills/i,
    });
    expect(otherCard).not.toHaveAttribute('data-favorite-team');
  });

  it('hides gracefully when the scoreboard request fails, without breaking the page', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('network down'));
    renderApp('/', { fetchImplementation });

    await waitFor(() => expect(fetchImplementation).toHaveBeenCalled());
    expect(
      screen.queryByRole('region', { name: 'NFL scoreboard' }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: /your front row to football/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows a View Schedule link instead of empty cards when there are no relevant games', async () => {
    renderApp('/', { fetchImplementation: scoreboardFetch([]) });

    expect(
      await screen.findByRole('link', { name: /view schedule/i }),
    ).toHaveAttribute('href', '/games');
  });
});
