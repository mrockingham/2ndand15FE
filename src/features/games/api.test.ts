import { createApiClient } from '@/services/api/apiClient';
import { getGame, listGames, listTeamGames } from '@/features/games/api';
import { gameFixture } from '@/test/gameFixtures';

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
});
