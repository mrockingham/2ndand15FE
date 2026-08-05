import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameTeam } from '@/features/games/types';
import type { Team } from '@/features/teams/types';
import { currentUserFixture } from '@/test/authFixtures';
import {
  awayGameTeamFixture,
  gameFixture,
  homeGameTeamFixture,
  tbdGameFixture,
} from '@/test/gameFixtures';
import { renderApp } from '@/test/renderApp';

const teamFromGame = (team: GameTeam): Team => ({
  ...team,
  league: 'NFL',
  city: team.fullName.split(' ')[0] ?? team.fullName,
  name: team.fullName.split(' ').at(-1) ?? team.fullName,
  conference: 'AFC',
  division: 'East',
  logoSource: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const teams = [
  teamFromGame(awayGameTeamFixture),
  teamFromGame(homeGameTeamFixture),
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const scheduleFetch = (games = [gameFixture, tbdGameFixture]) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/teams'))
      return Promise.resolve(json({ data: teams }));
    if (url.pathname.includes('/games'))
      return Promise.resolve(json({ data: games, meta: { nextCursor: null } }));
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });

describe('public Games pages', () => {
  it('lazy-loads the real schedule, requests the selected week, and renders nullable kickoffs safely', async () => {
    const fetchImplementation = scheduleFetch();
    renderApp('/games?type=REG&week=16', { fetchImplementation });

    expect(screen.getByRole('status')).toHaveTextContent('Loading page…');
    expect(
      await screen.findByRole('heading', { name: 'Games' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Time TBD', { selector: 'h3' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(fetchImplementation).toHaveBeenCalledWith(
        expect.stringContaining('/games?seasonType=REG&week=16&limit=100'),
        expect.anything(),
      ),
    );
  });

  it('keeps season type, week, and team in the URL while navigating', async () => {
    const { router } = renderApp(
      `/games?type=PRE&week=1&team=${awayGameTeamFixture.id}`,
      { fetchImplementation: scheduleFetch() },
    );
    await screen.findByRole('heading', { name: 'Games' });
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(router.state.location.search).toContain('type=PRE');
    expect(router.state.location.search).toContain('week=2');
    expect(router.state.location.search).toContain(
      `team=${awayGameTeamFixture.id}`,
    );
  });

  it('offers My Team only to a signed-in user with a favorite and shows a valid bye', async () => {
    const favoriteTeam = teams[0]!;
    const fetchImplementation = scheduleFetch([]);
    renderApp(`/games?type=REG&week=7&team=${favoriteTeam.id}`, {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam },
      fetchImplementation,
    });
    expect(
      await screen.findByRole('button', {
        name: `My Team · ${favoriteTeam.abbreviation}`,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Bye week' }),
    ).toBeInTheDocument();
  });

  it('does not show a broken My Team control when signed out', async () => {
    renderApp('/games?type=REG&week=1', {
      fetchImplementation: scheduleFetch([]),
    });
    await screen.findByRole('heading', { name: 'Games' });
    expect(
      screen.queryByRole('button', { name: /My Team/ }),
    ).not.toBeInTheDocument();
  });

  it('renders a detail page using only resolved public fields and handles a 404', async () => {
    const successFetch = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        json({
          data: {
            ...gameFixture,
            status: 'FINAL',
            awayScore: 21,
            homeScore: 17,
          },
        }),
      ),
    );
    renderApp(`/games/${gameFixture.id}`, {
      fetchImplementation: successFetch,
    });
    expect(
      await screen.findByRole('heading', { name: 'Game details' }),
    ).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(
      screen.queryByText(/provider|provenance|override|verification/i),
    ).not.toBeInTheDocument();

    const notFoundFetch = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        json({ error: { code: 'NOT_FOUND', message: 'Missing' } }, 404),
      ),
    );
    renderApp('/games/99999999-9999-4999-8999-999999999999', {
      fetchImplementation: notFoundFetch,
    });
    expect(
      await screen.findByRole('heading', { name: 'Game not found' }),
    ).toBeInTheDocument();
  });

  it('renders the favorite-team next game on Home and isolates schedule failures', async () => {
    const favoriteTeam = teams[0]!;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.includes(`/teams/${favoriteTeam.id}/games`)) {
        return Promise.resolve(
          json({ data: [tbdGameFixture], meta: { nextCursor: null } }),
        );
      }
      if (
        url.pathname.endsWith('/articles/featured') ||
        url.pathname.endsWith('/articles')
      ) {
        return Promise.resolve(json({ data: [], meta: { nextCursor: null } }));
      }
      return Promise.reject(new TypeError('schedule unavailable'));
    });
    renderApp('/', {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam },
      fetchImplementation,
    });
    await screen.findByText('NEXT GAME');
    expect(screen.getByText('Week 16 · Time TBD')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Welcome back/ }),
    ).toBeInTheDocument();
  });
});
