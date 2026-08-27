import {
  getRecentPerformance,
  getCurrentGameStats,
  getSeasonLeaders,
  getStatsMetadata,
  getWeeklyLeaders,
} from '@/features/statsHub/api';
import { createApiClient } from '@/services/api/apiClient';
import { playerAttributionFixture } from '@/test/playerFixtures';
import {
  recentPerformanceFixture,
  seasonLeaderFixture,
  statsMetadataFixture,
  weeklyLeaderFixture,
} from '@/test/statsHubFixtures';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Stats Hub API', () => {
  it('loads a current-season week with one bounded collection request', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      json({
        data: { season: 2026, seasonType: 'PRE', week: 1, games: [] },
        meta: {
          availableSeasons: [2026],
          availableSeasonTypes: ['PRE'],
          availableWeeks: [1, 2],
          coverageNote: 'Coverage varies.',
        },
      }),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const controller = new AbortController();
    const result = await getCurrentGameStats(
      client,
      { season: 2026, seasonType: 'PRE', week: 1 },
      controller.signal,
    );
    expect(result).toMatchObject({
      season: 2026,
      seasonType: 'PRE',
      availableWeeks: [1, 2],
    });
    expect(fetchImplementation).toHaveBeenCalledOnce();
    expect(fetchImplementation).toHaveBeenCalledWith(
      'http://localhost/api/v1/games/current-stats?season=2026&seasonType=PRE&week=1',
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
  });

  it('uses metadata and both leaderboard endpoints with exact filters and abort signals', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          data: statsMetadataFixture,
          meta: { attribution: playerAttributionFixture },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: [seasonLeaderFixture],
          meta: {
            nextCursor: 'opaque',
            metric: statsMetadataFixture.metrics[0],
            attribution: playerAttributionFixture,
          },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: [weeklyLeaderFixture],
          meta: {
            nextCursor: null,
            metric: statsMetadataFixture.metrics[0],
            attribution: playerAttributionFixture,
          },
        }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const controller = new AbortController();

    await getStatsMetadata(client, controller.signal);
    const filters = {
      season: 2025,
      seasonType: 'REG' as const,
      metric: 'passing_yards',
      week: 10,
      position: 'QB',
      positionGroup: 'QB',
      teamId: '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
      limit: 25,
    };
    await getSeasonLeaders(client, filters, controller.signal, 'opaque');
    await getWeeklyLeaders(client, filters, controller.signal);

    const urls = fetchImplementation.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe('http://localhost/api/v1/stats/metadata');
    expect(urls[1]).not.toContain('week=');
    expect(urls[1]).toContain('cursor=opaque');
    expect(urls[2]).toContain('/stats/weekly-leaders?');
    expect(urls[2]).toContain('week=10');
    expect(
      fetchImplementation.mock.calls.every(
        (call) => (call[1] as RequestInit).signal === controller.signal,
      ),
    ).toBe(true);
  });

  it('sends bounded recent filters and maps the backend summary without recalculation', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        json({
          data: {
            player: recentPerformanceFixture.player,
            performances: recentPerformanceFixture.performances,
            summary: recentPerformanceFixture.summary,
          },
          meta: {
            metric: recentPerformanceFixture.metric,
            attribution: recentPerformanceFixture.attribution,
          },
        }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const result = await getRecentPerformance(client, {
      playerId: seasonLeaderFixture.player.id,
      metric: 'passing_yards',
      season: 2025,
      seasonType: 'REG',
      games: 10,
    });

    expect(result.summary).toEqual(recentPerformanceFixture.summary);
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('games=10'),
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
