import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { gameFixture } from '@/test/gameFixtures';
import {
  awayTeamStatsFixture,
  gamePlaysFixture,
  generateGamePlaysFixture,
  homeTeamStatsFixture,
  scoringPlayFixture,
  turnoverPlayFixture,
} from '@/test/gamePlaysFixtures';
import { renderApp } from '@/test/renderApp';
import type { Game, GamePlay, GameTeamStats } from '@/features/games/types';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const playsBody = (plays: readonly GamePlay[]) => ({
  data: { gameId: gameFixture.id, playCount: plays.length, plays },
  meta: { limitations: [] },
});

const statsBody = (away: GameTeamStats, home: GameTeamStats) => ({
  data: {
    gameId: gameFixture.id,
    teamStats: { home, away },
    playerStats: { home: {}, away: {} },
  },
  meta: {
    playerStatsAvailable: false,
    playerStatsCoverage: null,
    limitations: [],
  },
});

const statsNotFound = () =>
  json({ error: { code: 'GAME_STATS_NOT_FOUND', message: 'Not found' } }, 404);

interface FetchCounts {
  game: number;
  plays: number;
  stats: number;
}

const buildFetch = (
  game: Game,
  {
    plays = [],
    statsResponse = statsNotFound(),
    playsResponse,
    counts,
  }: {
    readonly plays?: readonly GamePlay[];
    readonly statsResponse?: Response;
    readonly playsResponse?: Response;
    readonly counts?: FetchCounts;
  } = {},
) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/plays')) {
      if (counts) counts.plays += 1;
      return Promise.resolve((playsResponse ?? json(playsBody(plays))).clone());
    }
    if (url.pathname.endsWith('/stats')) {
      if (counts) counts.stats += 1;
      return Promise.resolve(statsResponse.clone());
    }
    if (counts) counts.game += 1;
    return Promise.resolve(json({ data: game }));
  });

describe('Game Center', () => {
  it('shows a pregame scoreboard with no fabricated score and a factual empty state', async () => {
    const scheduled: Game = {
      ...gameFixture,
      status: 'SCHEDULED',
      awayScore: null,
      homeScore: null,
    };
    renderApp(`/games/${scheduled.id}`, {
      fetchImplementation: buildFetch(scheduled),
    });

    expect(
      await screen.findByRole('heading', { name: 'Game Center' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(
      await screen.findByText('Game data will appear once action begins.'),
    ).toBeInTheDocument();
  });

  it('shows a factual 0–0 for a live game and a factual final score for a finished one', async () => {
    const live: Game = {
      ...gameFixture,
      status: 'IN_PROGRESS',
      awayScore: 0,
      homeScore: 0,
      quarter: 1,
      clock: '14:58',
    };
    renderApp(`/games/${live.id}`, { fetchImplementation: buildFetch(live) });
    await screen.findByRole('heading', { name: 'Game Center' });
    expect(screen.getByText('Q1 · 14:58')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('defaults to the Plays tab, shows both tabs when both exist, and switches to Team Stats', async () => {
    const finalGame: Game = {
      ...gameFixture,
      status: 'FINAL',
      awayScore: 24,
      homeScore: 20,
    };
    renderApp(`/games/${finalGame.id}`, {
      fetchImplementation: buildFetch(finalGame, {
        plays: gamePlaysFixture,
        statsResponse: json(
          statsBody(awayTeamStatsFixture, homeTeamStatsFixture),
        ),
      }),
    });

    await screen.findByRole('heading', { name: 'Game Center' });
    const playsTab = await screen.findByRole('tab', { name: 'Plays' });
    const statsTab = screen.getByRole('tab', { name: 'Team Stats' });
    expect(playsTab).toHaveAttribute('aria-selected', 'true');
    expect(statsTab).toHaveAttribute('aria-selected', 'false');
    expect(
      await screen.findByText(scoringPlayFixture.description),
    ).toBeInTheDocument();
    expect(screen.getByText('SCORE')).toBeInTheDocument();
    expect(screen.getByText('TURNOVER')).toBeInTheDocument();
    expect(screen.getByText('FLAG')).toBeInTheDocument();

    await userEvent.click(statsTab);
    expect(await screen.findByText('Total yards')).toBeInTheDocument();
    expect(screen.getByText('389')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
  });

  it('isolates a plays failure from the scoreboard and team stats', async () => {
    const finalGame: Game = {
      ...gameFixture,
      status: 'FINAL',
      awayScore: 24,
      homeScore: 20,
    };
    renderApp(`/games/${finalGame.id}`, {
      fetchImplementation: buildFetch(finalGame, {
        playsResponse: json(
          { error: { code: 'INVALID', message: 'Boom' } },
          400,
        ),
        statsResponse: json(
          statsBody(awayTeamStatsFixture, homeTeamStatsFixture),
        ),
      }),
    });

    await screen.findByRole('heading', { name: 'Game Center' });
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Team Stats' }));
    expect(await screen.findByText('Total yards')).toBeInTheDocument();
  });

  it('isolates a stats failure from the scoreboard and plays', async () => {
    const finalGame: Game = {
      ...gameFixture,
      status: 'FINAL',
      awayScore: 24,
      homeScore: 20,
    };
    renderApp(`/games/${finalGame.id}`, {
      fetchImplementation: buildFetch(finalGame, {
        plays: gamePlaysFixture,
        statsResponse: json(
          { error: { code: 'INVALID', message: 'Boom' } },
          400,
        ),
      }),
    });

    await screen.findByRole('heading', { name: 'Game Center' });
    expect(
      await screen.findByText(scoringPlayFixture.description),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Team Stats' }));
    expect(
      await screen.findByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument();
  });

  it('refreshes the game, plays, and stats together, and preserves the selected play', async () => {
    const finalGame: Game = {
      ...gameFixture,
      status: 'FINAL',
      awayScore: 24,
      homeScore: 20,
    };
    const counts: FetchCounts = { game: 0, plays: 0, stats: 0 };
    renderApp(`/games/${finalGame.id}`, {
      fetchImplementation: buildFetch(finalGame, {
        plays: gamePlaysFixture,
        statsResponse: json(
          statsBody(awayTeamStatsFixture, homeTeamStatsFixture),
        ),
        counts,
      }),
    });

    await screen.findByRole('heading', { name: 'Game Center' });
    await waitFor(() => expect(counts.game).toBe(1));
    await waitFor(() => expect(counts.plays).toBe(1));
    await waitFor(() => expect(counts.stats).toBe(1));

    const turnoverRow = (
      await screen.findByText(turnoverPlayFixture.description)
    ).closest('button')!;
    await userEvent.click(turnoverRow);
    expect(turnoverRow).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(counts.game).toBe(2));
    await waitFor(() => expect(counts.plays).toBe(2));
    await waitFor(() => expect(counts.stats).toBe(2));

    const refreshedTurnoverRow = (
      await screen.findByText(turnoverPlayFixture.description)
    ).closest('button')!;
    expect(refreshedTurnoverRow).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders a large play feed keyed by stable play IDs without crashing', async () => {
    const finalGame: Game = {
      ...gameFixture,
      status: 'FINAL',
      awayScore: 24,
      homeScore: 20,
    };
    const largePlays = generateGamePlaysFixture(185);
    renderApp(`/games/${finalGame.id}`, {
      fetchImplementation: buildFetch(finalGame, {
        plays: largePlays,
        statsResponse: json(
          statsBody(awayTeamStatsFixture, homeTeamStatsFixture),
        ),
      }),
    });

    await screen.findByRole('heading', { name: 'Game Center' });
    const list = await screen.findByRole('list', {
      name: 'Play-by-play, newest first',
    });
    expect(within(list).getAllByRole('listitem')).toHaveLength(185);
  });
});
