import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Game, GameTeam } from '@/features/games/types';
import type { Team } from '@/features/teams/types';
import { currentUserFixture, eaglesFixture } from '@/test/authFixtures';
import {
  awayGameTeamFixture,
  gameFixture,
  hallOfFameGameFixture,
  homeGameTeamFixture,
  panthersGameTeamFixture,
  preseasonWeekOneFixture,
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

const homeHubResponse = (
  team: Team,
  upcoming: readonly Game[],
  recent: readonly Game[] = [],
) => ({
  data: {
    team,
    schedule: { season: 2026, upcoming, recent },
    news: { articles: [] },
    historicalData: {
      defaultSeason: null,
      rosterSeasons: [],
      statSeasons: [],
      positions: [],
      positionGroups: [],
      coverageNotes: [],
    },
  },
  meta: {
    attribution: {
      source: 'nflverse',
      license: 'CC BY 4.0',
      url: 'https://github.com/nflverse/nflverse-data',
    },
  },
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

  it('renders the reviewed null-week preseason result in the all-preseason view', async () => {
    const fetchImplementation = scheduleFetch([
      preseasonWeekOneFixture,
      hallOfFameGameFixture,
    ]);
    renderApp('/games?season=2026&type=PRE', { fetchImplementation });

    expect(
      await screen.findByRole('heading', {
        name: 'Preseason · All games',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Week')).toHaveTextContent('All Preseason');
    const hallOfFameLabel = await screen.findByText('Hall of Fame Game');
    const weekOneLabel = await screen.findByText('Preseason Week 1');
    expect(
      hallOfFameLabel.compareDocumentPosition(weekOneLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText(/Week (?:null|0)/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Carolina Panthers')).toHaveLength(2);
    expect(screen.getAllByText('Arizona Cardinals')).toHaveLength(2);
    expect(screen.getByText('33')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByText('Neutral site')).toBeInTheDocument();
    expect(
      screen.getByText(/Tom Benson Hall of Fame Stadium/),
    ).toBeInTheDocument();
    expect(screen.getByText('NBC')).toBeInTheDocument();
    expect(
      document.querySelector('[data-team-helmet="CAR"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-team-helmet="ARI"]'),
    ).toBeInTheDocument();
    const gameRequest = fetchImplementation.mock.calls.find(([input]) =>
      String(input).includes('/games?'),
    );
    expect(String(gameRequest?.[0])).toContain(
      '/games?season=2026&seasonType=PRE&limit=100',
    );
    expect(String(gameRequest?.[0])).not.toContain('week=');
  });

  it('keeps matchup helmets local when global accents use another favorite', async () => {
    const cowboys = {
      ...homeGameTeamFixture,
      fullName: 'Dallas Cowboys',
      abbreviation: 'DAL',
    };
    renderApp('/games?type=REG&week=16', {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam: eaglesFixture },
      fetchImplementation: scheduleFetch([
        { ...gameFixture, homeTeam: cowboys },
      ]),
    });

    await waitFor(() =>
      expect(
        document.querySelector('[data-team-helmet="DAL"]'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId('team-visual-theme-root')).toHaveAttribute(
      'data-team-visual',
      'PHI',
    );
    expect(
      document.querySelector('[data-team-helmet="PHI"]'),
    ).not.toBeInTheDocument();
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

  it('renders the Hall of Fame Game detail as a final neutral-site result', async () => {
    renderApp(`/games/${hallOfFameGameFixture.id}`, {
      fetchImplementation: vi.fn<typeof fetch>(() =>
        Promise.resolve(json({ data: hallOfFameGameFixture })),
      ),
    });

    expect(
      await screen.findByText(/2026 · Hall of Fame Game/),
    ).toBeInTheDocument();
    expect(screen.getByText('Carolina Panthers')).toBeInTheDocument();
    expect(screen.getByText('Arizona Cardinals')).toBeInTheDocument();
    expect(screen.getByText('33')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByText('Neutral site')).toBeInTheDocument();
    expect(
      screen.getByText('Tom Benson Hall of Fame Stadium · Canton, Ohio'),
    ).toBeInTheDocument();
    expect(screen.getByText('NBC')).toBeInTheDocument();
    expect(screen.queryByText(/Quarter 4|Q4|4 · 0/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/passing|rushing|receiving|box score/i),
    ).not.toBeInTheDocument();
  });

  it('refetches a fresh current-season schedule cache on remount', async () => {
    let gameRequests = 0;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(json({ data: teams }));
      if (url.pathname.endsWith('/games')) {
        gameRequests += 1;
        return Promise.resolve(
          json({
            data: [
              gameRequests === 1
                ? {
                    ...hallOfFameGameFixture,
                    status: 'SCHEDULED',
                    awayScore: null,
                    homeScore: null,
                  }
                : hallOfFameGameFixture,
            ],
            meta: { nextCursor: null },
          }),
        );
      }
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    const first = renderApp('/games?season=2026&type=PRE', {
      fetchImplementation,
    });
    await screen.findByText('Scheduled');
    first.unmount();

    renderApp('/games?season=2026&type=PRE', {
      fetchImplementation,
      queryClient: first.queryClient,
    });
    expect(await screen.findByText('33')).toBeInTheDocument();
    expect(gameRequests).toBe(2);
  });

  it('renders the favorite-team next game on Home and isolates schedule failures', async () => {
    const favoriteTeam = teams[0]!;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith(`/teams/${favoriteTeam.id}/hub`))
        return Promise.resolve(
          json(homeHubResponse(favoriteTeam, [tbdGameFixture])),
        );
      return Promise.resolve(
        json({ error: { code: 'NOT_AVAILABLE', message: 'Unavailable' } }, 404),
      );
    });
    renderApp('/', {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam },
      fetchImplementation,
    });
    await screen.findByText('NEXT GAME');
    expect(screen.getByText(/Time TBD/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Buffalo Bills' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('team-visual-theme-root')).toHaveAttribute(
      'data-team-visual',
      'BUF',
    );
    expect(
      screen.getAllByRole('img', { name: 'Buffalo Bills helmet' })[0],
    ).toBeInTheDocument();
  });

  it('does not keep a final null-week game in the Home next-game card', async () => {
    const favoriteTeam = teamFromGame(panthersGameTeamFixture);
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith(`/teams/${favoriteTeam.id}/hub`))
        return Promise.resolve(
          json(homeHubResponse(favoriteTeam, [], [hallOfFameGameFixture])),
        );
      return Promise.resolve(
        json({ error: { code: 'NOT_AVAILABLE', message: 'Unavailable' } }, 404),
      );
    });
    renderApp('/', {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam },
      fetchImplementation,
    });

    expect(await screen.findByText('LAST GAME')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Hall of Fame Game' }),
    ).toBeInTheDocument();
  });
});
