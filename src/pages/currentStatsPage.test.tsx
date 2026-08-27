import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  billsFixture,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import {
  cardinalsGameTeamFixture,
  panthersGameTeamFixture,
  preseasonWeekOneFixture,
} from '@/test/gameFixtures';
import {
  seasonLeaderFixture,
  statsMetadataFixture,
} from '@/test/statsHubFixtures';
import { renderApp } from '@/test/renderApp';
import { useThemePreferences } from '@/stores/themePreferences';

const completeGame = {
  ...preseasonWeekOneFixture,
  status: 'FINAL' as const,
  awayScore: 33,
  homeScore: 30,
};
const unavailableGame = {
  ...completeGame,
  id: '77777777-7777-4777-8777-777777777777',
  awayScore: 27,
  homeScore: 7,
};
const pendingGame = {
  ...completeGame,
  id: '88888888-8888-4888-8888-888888888888',
  status: 'SCHEDULED' as const,
  awayScore: null,
  homeScore: null,
};

const teamStats = (teamId: string, totalYards: number) => ({
  teamId,
  firstDowns: totalYards === 382 ? 19 : 22,
  totalPlays: 64,
  totalYards,
  passingYards: totalYards - 150,
  rushingYards: 150,
  turnovers: totalYards === 382 ? 0 : 2,
  sacks: 3,
  thirdDownConversions: 5,
  thirdDownAttempts: 12,
  fourthDownConversions: 1,
  fourthDownAttempts: 2,
  penalties: 6,
  penaltyYards: 45,
  possessionSeconds: 1_800,
  redZoneConversions: 2,
  redZoneAttempts: 3,
  scoringByPeriod: { q1: 7, q2: 10, q3: 3, q4: 10, ot1: null, ot2: null },
});

const currentResponse = () =>
  jsonResponse({
    data: {
      season: 2026,
      seasonType: 'PRE',
      week: 1,
      games: [
        {
          game: completeGame,
          coverage: 'COMPLETE',
          teamStats: {
            away: teamStats(panthersGameTeamFixture.id, 382),
            home: teamStats(cardinalsGameTeamFixture.id, 411),
          },
        },
        {
          game: unavailableGame,
          coverage: 'UNAVAILABLE',
          teamStats: { away: null, home: null },
        },
        {
          game: pendingGame,
          coverage: 'PENDING',
          teamStats: { away: null, home: null },
        },
      ],
    },
    meta: {
      availableSeasons: [2026],
      availableSeasonTypes: ['PRE'],
      availableWeeks: [1, 2],
      coverageNote:
        'Team statistics are available for games where current provider coverage is complete.',
    },
  });

const historicalMetadataResponse = () =>
  jsonResponse({
    data: statsMetadataFixture,
    meta: { attribution: playerAttributionFixture },
  });

const fetcher = () =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/games/current-stats'))
      return Promise.resolve(currentResponse());
    if (url.pathname.endsWith('/teams'))
      return Promise.resolve(jsonResponse({ data: [billsFixture] }));
    if (url.pathname.endsWith('/stats/metadata'))
      return Promise.resolve(historicalMetadataResponse());
    if (url.pathname.endsWith('/stats/leaders'))
      return Promise.resolve(
        jsonResponse({
          data: [seasonLeaderFixture],
          meta: {
            nextCursor: null,
            metric: statsMetadataFixture.metrics[0],
            ranking: { method: 'COMPETITION', tiedValuesShareRank: true },
            attribution: playerAttributionFixture,
          },
        }),
      );
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });

describe('current-season Stats mode', () => {
  it('defaults to 2026 preseason, renders all coverage states, and uses one collection request', async () => {
    const fetchImplementation = fetcher();
    const { router } = renderApp('/stats', { fetchImplementation });

    expect(
      await screen.findByRole('heading', { name: '2026 NFL Stats' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Preseason · Week 1')).toBeInTheDocument();
    const comparison = screen.getByLabelText('CAR and ARI team statistics');
    expect(within(comparison).getByText('382')).toBeInTheDocument();
    expect(within(comparison).getByText('411')).toBeInTheDocument();
    expect(
      screen.getByText('Team statistics unavailable for this game.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Stats will appear after game data is available.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Game Center' })).toHaveLength(
      3,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Week' }));
    expect(screen.getByRole('option', { name: 'Week 2' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('mode')).toBe('current');
      expect(search.get('season')).toBe('2026');
      expect(search.get('seasonType')).toBe('PRE');
      expect(search.get('week')).toBe('1');
    });
    expect(
      fetchImplementation.mock.calls.filter((call) =>
        String(call[0]).includes('/games/current-stats'),
      ),
    ).toHaveLength(1);
    expect(
      fetchImplementation.mock.calls.some((call) =>
        /\/games\/[0-9a-f-]+\/stats/.test(String(call[0])),
      ),
    ).toBe(false);
  });

  it('restores URL state, switches modes, and keeps Historical independently usable', async () => {
    const fetchImplementation = fetcher();
    const { router } = renderApp(
      '/stats?mode=current&season=2026&seasonType=PRE&week=1',
      {
        fetchImplementation,
      },
    );
    await screen.findByRole('heading', { name: '2026 NFL Stats' });
    await userEvent.click(screen.getByRole('tab', { name: 'Historical' }));
    expect(await screen.findAllByText('Alex Quarterback')).not.toHaveLength(0);
    expect(new URLSearchParams(router.state.location.search).get('mode')).toBe(
      'historical',
    );
    expect(
      fetchImplementation.mock.calls.some((call) =>
        String(call[0]).includes('/stats/metadata'),
      ),
    ).toBe(true);
  });

  it('offers a non-default favorite-team filter and sends only the internal team UUID', async () => {
    const fetchImplementation = fetcher();
    const { router } = renderApp(
      '/stats?mode=current&season=2026&seasonType=PRE&week=1',
      {
        restorationStatus: 'authenticated',
        currentUser: userWithFavoriteFixture,
        fetchImplementation,
      },
    );
    const button = await screen.findByRole('button', {
      name: 'Show My Team: BUF',
    });
    expect(
      new URLSearchParams(router.state.location.search).has('teamId'),
    ).toBe(false);
    await userEvent.click(button);
    await waitFor(() => {
      expect(
        new URLSearchParams(router.state.location.search).get('teamId'),
      ).toBe(billsFixture.id);
      expect(
        fetchImplementation.mock.calls.some((call) =>
          String(call[0]).includes(`teamId=${billsFixture.id}`),
        ),
      ).toBe(true);
    });
  });

  it.each(['light', 'dark'] as const)(
    'renders the current comparison in %s mode',
    async (mode) => {
      useThemePreferences.setState({ mode });
      renderApp('/stats?mode=current&season=2026&seasonType=PRE&week=1', {
        fetchImplementation: fetcher(),
      });
      expect(
        await screen.findByLabelText('CAR and ARI team statistics'),
      ).toBeVisible();
      expect(screen.getByText('Game stat comparisons')).toBeVisible();
    },
  );
});
