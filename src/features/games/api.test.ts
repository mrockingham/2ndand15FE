import { createApiClient } from '@/services/api/apiClient';
import {
  getGame,
  getGamePlays,
  getGameStats,
  listGames,
  listTeamGames,
} from '@/features/games/api';
import { gameFixture } from '@/test/gameFixtures';
import {
  awayTeamStatsFixture,
  gamePlaysFixture,
  homeTeamStatsFixture,
} from '@/test/gamePlaysFixtures';

describe('public games API', () => {
  it('sends only supported filters and the abort signal', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ data: [gameFixture], meta: { nextCursor: null } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const controller = new AbortController();
    const result = await listGames(
      client,
      {
        seasonType: 'REG',
        week: 16,
        teamId: gameFixture.awayTeam.id,
        limit: 100,
      },
      controller.signal,
    );
    expect(result.games).toEqual([gameFixture]);
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost/api/v1/games?seasonType=REG&week=16&teamId=${gameFixture.awayTeam.id}&limit=100`,
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
  });

  it('uses the bounded team schedule and detail endpoints', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ data: [gameFixture], meta: { nextCursor: null } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    await listTeamGames(client, gameFixture.awayTeam.id, { limit: 100 });
    expect(fetchImplementation.mock.calls[0]?.[0]).toBe(
      `http://localhost/api/v1/teams/${gameFixture.awayTeam.id}/games?limit=100`,
    );

    fetchImplementation.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: gameFixture }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await getGame(client, gameFixture.id);
    expect(fetchImplementation.mock.calls[1]?.[0]).toBe(
      `http://localhost/api/v1/games/${gameFixture.id}`,
    );
  });

  it('fetches structured plays and maps the envelope', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              gameId: gameFixture.id,
              playCount: gamePlaysFixture.length,
              plays: gamePlaysFixture,
            },
            meta: {
              limitations: ['Structured play-by-play has not been imported.'],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const result = await getGamePlays(client, gameFixture.id);
    expect(result.plays).toEqual(gamePlaysFixture);
    expect(result.limitations).toEqual([
      'Structured play-by-play has not been imported.',
    ]);
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost/api/v1/games/${gameFixture.id}/plays`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('fetches team stats and maps the envelope', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              gameId: gameFixture.id,
              teamStats: {
                home: homeTeamStatsFixture,
                away: awayTeamStatsFixture,
              },
              playerStats: { home: {}, away: {} },
            },
            meta: {
              playerStatsAvailable: false,
              playerStatsCoverage: null,
              limitations: [],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const result = await getGameStats(client, gameFixture.id);
    expect(result.coverage).toBe('AVAILABLE');
    expect(result.teamStats).toEqual({
      home: homeTeamStatsFixture,
      away: awayTeamStatsFixture,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost/api/v1/games/${gameFixture.id}/stats`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('treats a 404 on stats as an unavailable-coverage result, not a thrown error', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: { code: 'GAME_STATS_NOT_FOUND', message: 'Not found' },
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const result = await getGameStats(client, gameFixture.id);
    expect(result.coverage).toBe('UNAVAILABLE');
    expect(result.teamStats).toEqual({ home: null, away: null });
  });
});
