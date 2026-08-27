import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  apiErrorResponse,
  billsFixture,
  currentUserFixture,
  eaglesFixture,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import { publicArticleFixture } from '@/test/articleFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import { hallOfFameGameFixture } from '@/test/gameFixtures';
import {
  seasonLeaderFixture,
  statsMetadataFixture,
} from '@/test/statsHubFixtures';
import {
  recentTeamGameFixture,
  teamHubOverviewFixture,
  teamRosterRowFixture,
  teamRosterSemanticsFixture,
} from '@/test/teamHubFixtures';
import { renderApp } from '@/test/renderApp';

const hubResponse = (overview = teamHubOverviewFixture) =>
  jsonResponse({
    data: overview,
    meta: { attribution: playerAttributionFixture },
  });

const metadataResponse = () =>
  jsonResponse({
    data: statsMetadataFixture,
    meta: { attribution: playerAttributionFixture },
  });

const rosterResponse = (
  roster: readonly unknown[] = [teamRosterRowFixture],
  nextCursor: string | null = null,
) =>
  jsonResponse({
    data: { team: billsFixture, season: 2025, roster },
    meta: {
      nextCursor,
      semantics: teamRosterSemanticsFixture,
      attribution: playerAttributionFixture,
    },
  });

const leadersResponse = (
  data: readonly unknown[] = [
    {
      ...seasonLeaderFixture,
      teamContext: {
        type: 'SINGLE',
        teams: [
          {
            id: billsFixture.id,
            abbreviation: billsFixture.abbreviation,
            fullName: billsFixture.fullName,
          },
        ],
      },
    },
  ],
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

const teamHubFetch = (
  options: {
    readonly overview?: typeof teamHubOverviewFixture;
    readonly metadataError?: boolean;
    readonly rosterNextCursor?: string | null;
    readonly leadersNextCursor?: string | null;
  } = {},
) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith(`/teams/${billsFixture.id}/hub`))
      return Promise.resolve(hubResponse(options.overview));
    if (url.pathname.endsWith('/stats/metadata'))
      return Promise.resolve(
        options.metadataError
          ? apiErrorResponse('STATS_INVALID_METRIC', 'No', 400)
          : metadataResponse(),
      );
    if (url.pathname.endsWith(`/teams/${billsFixture.id}/roster`))
      return Promise.resolve(
        url.searchParams.has('cursor')
          ? rosterResponse([
              {
                ...teamRosterRowFixture,
                player: {
                  ...teamRosterRowFixture.player,
                  displayName: 'Second Roster Player',
                },
              },
            ])
          : rosterResponse(
              [teamRosterRowFixture],
              options.rosterNextCursor ?? null,
            ),
      );
    if (url.pathname.endsWith(`/teams/${billsFixture.id}/stat-leaders`))
      return Promise.resolve(
        url.searchParams.has('cursor')
          ? leadersResponse([
              {
                ...seasonLeaderFixture,
                rank: 4,
                metricValue: 0,
              },
            ])
          : leadersResponse(undefined, options.leadersNextCursor ?? null),
      );
    if (url.pathname.endsWith('/teams'))
      return Promise.resolve(
        jsonResponse({ data: [billsFixture, eaglesFixture] }),
      );
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });

describe('public Teams directory', () => {
  it('shows a deliberate catalog loading state after the route chunk resolves', async () => {
    const view = renderApp('/teams', {
      fetchImplementation: vi.fn<typeof fetch>(
        () => new Promise<Response>(() => undefined),
      ),
    });
    expect(await screen.findByLabelText('Loading teams')).toBeInTheDocument();
    view.unmount();
  });

  it('lazy-loads, groups teams by conference and division, links cards, and shows logo fallbacks', async () => {
    const fetchImplementation = teamHubFetch();
    renderApp('/teams', { fetchImplementation });

    expect(
      await screen.findByRole('heading', { name: 'Teams', level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'AFC' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'NFC' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'East' })).toHaveLength(2);
    expect(
      document.querySelector('[data-team-card="BUF"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-team-card="PHI"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Buffalo Bills helmet' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buffalo Bills' })).toHaveAttribute(
      'href',
      `/teams/${billsFixture.id}`,
    );
  });

  it('keeps search and conference/division filters shareable and provides factual emptiness', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/teams', {
      fetchImplementation: teamHubFetch(),
    });
    await screen.findByText('Buffalo Bills');

    await user.type(screen.getByLabelText('Search teams'), 'Philadelphia');
    expect(screen.queryByText('Buffalo Bills')).not.toBeInTheDocument();
    expect(screen.getByText('Philadelphia Eagles')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).get('search'),
      ).toBe('Philadelphia'),
    );

    await user.click(screen.getByLabelText('Conference'));
    await user.click(screen.getByRole('option', { name: 'AFC' }));
    expect(
      screen.getByText(/No active teams match the selected search and filters/),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText('Division'));
    await user.click(screen.getByRole('option', { name: 'West' }));
    expect(
      new URLSearchParams(router.state.location.search).get('division'),
    ).toBe('West');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(router.state.location.search).toBe('');
  });

  it('indicates and replaces an authenticated favorite using the shared mutation', async () => {
    const user = userEvent.setup();
    const updatedUser = { ...currentUserFixture, favoriteTeam: eaglesFixture };
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(
          jsonResponse({ data: [billsFixture, eaglesFixture] }),
        );
      if (
        url.pathname.endsWith('/users/me/favorite-team') &&
        init?.method === 'PATCH'
      )
        return Promise.resolve(jsonResponse({ data: { user: updatedUser } }));
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    renderApp('/teams', {
      restorationStatus: 'authenticated',
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
    });

    expect(
      await screen.findByRole('button', {
        name: 'Buffalo Bills is your favorite team',
      }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole('button', {
        name: 'Set Philadelphia Eagles as favorite team',
      }),
    );
    const request = fetchImplementation.mock.calls.find(([input]) =>
      String(input).endsWith('/users/me/favorite-team'),
    );
    expect(JSON.parse(String(request?.[1]?.body))).toEqual({
      favoriteTeamId: eaglesFixture.id,
    });
    expect(
      await screen.findByRole('button', {
        name: 'Philadelphia Eagles is your favorite team',
      }),
    ).toBeDisabled();
  });

  it('sends anonymous favorite actions through the existing login flow', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/teams', {
      fetchImplementation: teamHubFetch(),
    });
    await user.click(
      await screen.findByRole('button', {
        name: 'Set Buffalo Bills as favorite team',
      }),
    );
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/teams' });
  });
});

describe('public Team Hub page', () => {
  it('shows the Hall of Fame result as Carolina win and Arizona loss, never upcoming', async () => {
    const panthersTeam = {
      ...billsFixture,
      id: hallOfFameGameFixture.awayTeam.id,
      city: 'Carolina',
      name: 'Panthers',
      fullName: 'Carolina Panthers',
      abbreviation: 'CAR',
      conference: 'NFC' as const,
      division: 'South' as const,
    };
    const cardinalsTeam = {
      ...billsFixture,
      id: hallOfFameGameFixture.homeTeam.id,
      city: 'Arizona',
      name: 'Cardinals',
      fullName: 'Arizona Cardinals',
      abbreviation: 'ARI',
      conference: 'NFC' as const,
      division: 'West' as const,
    };
    const schedule = {
      season: 2026,
      upcoming: [],
      recent: [hallOfFameGameFixture],
    };
    const carolina = renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: teamHubFetch({
        overview: { ...teamHubOverviewFixture, team: panthersTeam, schedule },
      }),
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Carolina Panthers',
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Win · completed score')).toBeInTheDocument();
    expect(screen.getAllByText('Hall of Fame Game').length).toBeGreaterThan(0);
    expect(screen.getAllByText('33').length).toBeGreaterThan(0);
    expect(screen.getAllByText('30').length).toBeGreaterThan(0);
    expect(
      screen.getByText('No upcoming games are currently stored.'),
    ).toBeInTheDocument();
    carolina.unmount();

    renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: teamHubFetch({
        overview: { ...teamHubOverviewFixture, team: cardinalsTeam, schedule },
      }),
    });
    expect(
      await screen.findByRole('heading', {
        name: 'Arizona Cardinals',
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Loss · completed score')).toBeInTheDocument();
    expect(screen.getAllByText('Hall of Fame Game').length).toBeGreaterThan(0);
  });

  it('keeps global favorite accents separate from the viewed team hero', async () => {
    const raidersFavorite = {
      ...billsFixture,
      id: '99999999-9999-4999-8999-999999999999',
      city: 'Las Vegas',
      name: 'Raiders',
      fullName: 'Las Vegas Raiders',
      abbreviation: 'LV',
    };
    const eaglesOverview = {
      ...teamHubOverviewFixture,
      team: eaglesFixture,
    };
    renderApp(`/teams/${billsFixture.id}`, {
      restorationStatus: 'authenticated',
      currentUser: {
        ...currentUserFixture,
        favoriteTeam: raidersFavorite,
      },
      fetchImplementation: teamHubFetch({ overview: eaglesOverview }),
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Philadelphia Eagles',
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('team-visual-theme-root')).toHaveAttribute(
      'data-team-visual',
      'LV',
    );
    expect(
      document.querySelector('[data-team-hub-identity="PHI"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Philadelphia Eagles helmet' }),
    ).toHaveAttribute('data-team-helmet', 'PHI');
  });

  it('renders identity, schedule, published news, historical roster, leaders, and normalized URL state', async () => {
    const fetchImplementation = teamHubFetch();
    const { router } = renderApp(
      `/teams/${billsFixture.id}?rosterSeason=2026&leaderSeason=2099&private=secret`,
      { fetchImplementation },
    );

    expect(
      await screen.findByRole('heading', { name: 'Buffalo Bills', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/BUF.*AFC East/)).toBeInTheDocument();
    expect(screen.getByText(/Win.*completed score/)).toBeInTheDocument();
    expect(screen.getByText(publicArticleFixture.title)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: publicArticleFixture.title }),
    ).toHaveAttribute('href', `/news/${publicArticleFixture.slug}`);
    expect(
      await screen.findAllByText(teamRosterRowFixture.player.displayName),
    ).not.toHaveLength(0);
    expect(screen.getAllByText('PHI').length).toBeGreaterThan(0);
    expect((await screen.findAllByLabelText('Rank 1')).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('4,500').length).toBeGreaterThan(0);
    expect(screen.getByText('NEXT GAME')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Team at a glance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Explore the league' }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('link', { name: 'Open in full Stats Hub' })
        .getAttribute('href'),
    ).toContain(`teamId=${billsFixture.id}`);
    expect(
      screen.getByText(teamHubOverviewFixture.historicalData.coverageNotes[0]),
    ).toBeInTheDocument();
    await waitFor(() => {
      const state = new URLSearchParams(router.state.location.search);
      expect(Object.fromEntries(state)).toMatchObject({
        rosterSeason: '2025',
        leaderSeason: '2025',
        leaderType: 'REG',
        leaderCategory: 'PASSING',
        leaderMetric: 'passing_yards',
      });
      expect(state.has('private')).toBe(false);
      expect(state.has('cursor')).toBe(false);
    });

    const calls = fetchImplementation.mock.calls.map(([input]) =>
      String(input),
    );
    expect(calls.findIndex((url) => url.endsWith('/hub'))).toBeLessThan(
      calls.findIndex((url) => url.includes('/roster?')),
    );
  });

  it('changes historical and statistical filters and passes opaque cursors unchanged', async () => {
    const user = userEvent.setup();
    const fetchImplementation = teamHubFetch({
      rosterNextCursor: 'opaque.roster',
      leadersNextCursor: 'opaque.leader',
    });
    const { router } = renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation,
    });
    await screen.findAllByText(teamRosterRowFixture.player.displayName);

    await user.click(screen.getByLabelText('Roster season'));
    await user.click(screen.getByRole('option', { name: '2024' }));
    await user.click(screen.getByLabelText('Historical position'));
    await user.click(screen.getByRole('option', { name: 'QB' }));
    await user.type(screen.getByLabelText('Search roster'), 'Alex');
    await waitFor(
      () =>
        expect(
          fetchImplementation.mock.calls.some(([input]) => {
            const url = new URL(String(input));
            return (
              url.pathname.endsWith('/roster') &&
              url.searchParams.get('season') === '2024' &&
              url.searchParams.get('position') === 'QB' &&
              url.searchParams.get('search') === 'Alex'
            );
          }),
        ).toBe(true),
      { timeout: 2500 },
    );
    expect(
      new URLSearchParams(router.state.location.search).get('rosterSearch'),
    ).toBe('Alex');

    await user.click(
      await screen.findByRole('button', {
        name: 'Load more roster players',
      }),
    );
    expect(await screen.findAllByText('Second Roster Player')).not.toHaveLength(
      0,
    );
    await user.click(
      await screen.findByRole('button', { name: 'Load more team leaders' }),
    );
    expect((await screen.findAllByLabelText('Rank 4')).length).toBeGreaterThan(
      0,
    );
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('cursor=opaque.roster'),
      ),
    ).toBe(true);
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('cursor=opaque.leader'),
      ),
    ).toBe(true);
    expect(router.state.location.search).not.toContain('cursor');
  }, 15_000);

  it('isolates Stats metadata failure while preserving the Team Hub and roster', async () => {
    renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: teamHubFetch({ metadataError: true }),
    });

    expect(
      await screen.findByRole('heading', { name: 'Buffalo Bills', level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByText(teamRosterRowFixture.player.displayName),
    ).not.toHaveLength(0);
    expect(
      screen.getByText(/Team leader options are unavailable/),
    ).toBeInTheDocument();
    expect(screen.getByText(publicArticleFixture.title)).toBeInTheDocument();
  });

  it('shows distinct factual empty states without inventing current data', async () => {
    const emptyOverview = {
      ...teamHubOverviewFixture,
      schedule: {
        ...teamHubOverviewFixture.schedule,
        upcoming: [],
        recent: [],
      },
      news: { articles: [] },
      historicalData: {
        ...teamHubOverviewFixture.historicalData,
        rosterSeasons: [],
        statSeasons: [],
      },
    };
    renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: teamHubFetch({ overview: emptyOverview }),
    });

    expect(
      await screen.findByText('No upcoming games are currently stored.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No recent completed games are currently stored.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No published news is currently available/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No historical roster seasons are available/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No historical statistical seasons are available/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/injuries, depth charts.*are not included/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Explore the league' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('NEXT GAME')).not.toBeInTheDocument();
    expect(screen.queryByText('LAST GAME')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Team at a glance' }),
    ).not.toBeInTheDocument();
  });

  it('renders invalid and unknown team identifiers with the existing not-found experience', async () => {
    const invalidFetch = vi.fn<typeof fetch>(() =>
      Promise.reject(new TypeError('Unexpected test request')),
    );
    const invalid = renderApp('/teams/not-a-uuid', {
      fetchImplementation: invalidFetch,
    });
    expect(
      await screen.findByRole('heading', {
        name: 'This route missed the mark.',
      }),
    ).toBeInTheDocument();
    expect(invalidFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/teams/'),
      expect.anything(),
    );
    invalid.unmount();

    renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: vi.fn<typeof fetch>((input) => {
        const url = new URL(String(input));
        if (url.pathname.endsWith('/hub'))
          return Promise.resolve(
            apiErrorResponse('TEAM_NOT_FOUND', 'Unknown team', 404),
          );
        return Promise.reject(
          new TypeError(`Unexpected request: ${url.pathname}`),
        );
      }),
    });
    expect(
      await screen.findByRole('heading', {
        name: 'This route missed the mark.',
      }),
    ).toBeInTheDocument();
  });

  it('does not derive a result when a completed score is incomplete', async () => {
    const tbdGame = {
      ...recentTeamGameFixture,
      id: '88888888-8888-4888-8888-888888888888',
      status: 'SCHEDULED' as const,
      startTime: null,
      awayScore: null,
      homeScore: null,
    };
    const overview = {
      ...teamHubOverviewFixture,
      schedule: {
        ...teamHubOverviewFixture.schedule,
        upcoming: [tbdGame],
        recent: [{ ...recentTeamGameFixture, awayScore: null }],
      },
    };
    renderApp(`/teams/${billsFixture.id}`, {
      fetchImplementation: teamHubFetch({ overview }),
    });

    await screen.findByRole('heading', { name: 'Buffalo Bills', level: 1 });
    expect(screen.queryByText(/completed score/)).not.toBeInTheDocument();
    expect(screen.getByText('Time TBD')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link')
        .find((link) => link.getAttribute('href') === `/games/${tbdGame.id}`),
    ).toBeDefined();
  });
});
