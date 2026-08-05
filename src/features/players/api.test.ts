import {
  getPlayer,
  listPlayers,
  listPlayerSeasons,
  listPlayerStats,
} from '@/features/players/api';
import { createApiClient } from '@/services/api/apiClient';
import {
  playerAttributionFixture,
  playerTeamFixture,
  quarterbackFixture,
  quarterbackGameFixture,
  quarterbackSeasonFixture,
} from '@/test/playerFixtures';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('public players API', () => {
  it('sends the supported directory filters, cursor, and abort signal', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        json({
          data: [quarterbackFixture],
          meta: {
            nextCursor: quarterbackFixture.id,
            attribution: playerAttributionFixture,
          },
        }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const controller = new AbortController();
    const result = await listPlayers(
      client,
      {
        search: 'Alex Quarterback',
        teamId: playerTeamFixture.id,
        position: 'QB',
        season: 2025,
        limit: 24,
      },
      controller.signal,
      quarterbackFixture.id,
    );

    expect(result.players).toEqual([quarterbackFixture]);
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost/api/v1/players?search=Alex+Quarterback&teamId=${playerTeamFixture.id}&position=QB&season=2025&limit=24&cursor=${quarterbackFixture.id}`,
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
  });

  it('uses only the detail, game-stat, and season-summary endpoints', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          data: quarterbackFixture,
          meta: { attribution: playerAttributionFixture },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: [quarterbackGameFixture],
          meta: { nextCursor: null, attribution: playerAttributionFixture },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: [quarterbackSeasonFixture],
          meta: { attribution: playerAttributionFixture },
        }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });

    await getPlayer(client, quarterbackFixture.id);
    await listPlayerStats(client, quarterbackFixture.id, {
      season: 2025,
      week: 1,
      seasonType: 'REG',
      limit: 100,
    });
    await listPlayerSeasons(client, quarterbackFixture.id);

    expect(fetchImplementation.mock.calls.map((call) => call[0])).toEqual([
      `http://localhost/api/v1/players/${quarterbackFixture.id}`,
      `http://localhost/api/v1/players/${quarterbackFixture.id}/stats?season=2025&week=1&seasonType=REG&limit=100`,
      `http://localhost/api/v1/players/${quarterbackFixture.id}/seasons`,
    ]);
  });
});
