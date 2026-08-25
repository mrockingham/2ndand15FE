import { createApiClient } from '@/services/api/apiClient';
import {
  getDataHealthGame,
  listDataHealthGames,
  listDataHealthProbes,
  runDataHealthProbe,
} from '@/features/dataHealth/api';
import {
  dataHealthGameDetailFixture,
  dataHealthGameListRowsFixture,
  dataHealthProbeRecordFixture,
  dataHealthProbeResultFixture,
  dataHealthSummaryFixture,
} from '@/test/dataHealthFixtures';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('data health API', () => {
  it('lists games with authenticated requests and only supported filters', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse({
          data: dataHealthGameListRowsFixture,
          summary: dataHealthSummaryFixture,
          meta: { nextCursor: 'cursor-1' },
        }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    const result = await listDataHealthGames(client, {
      season: 2026,
      issuesOnly: true,
      teamId: undefined,
    });
    expect(result.games).toEqual(dataHealthGameListRowsFixture);
    expect(result.summary).toEqual(dataHealthSummaryFixture);
    expect(result.nextCursor).toBe('cursor-1');
    expect(fetchImplementation).toHaveBeenCalledWith(
      'http://localhost/api/v1/admin/data-health/games?season=2026&issuesOnly=true',
      expect.objectContaining({ method: 'GET' }),
    );
    const headers = (fetchImplementation.mock.calls[0]?.[1] as RequestInit)
      .headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token');
  });

  it('fetches one game detail', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ data: dataHealthGameDetailFixture })),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    const result = await getDataHealthGame(
      client,
      dataHealthGameDetailFixture.gameId,
    );
    expect(result).toEqual(dataHealthGameDetailFixture);
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost/api/v1/admin/data-health/games/${dataHealthGameDetailFixture.gameId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('lists persisted probe history newest first', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ data: [dataHealthProbeRecordFixture] })),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    const result = await listDataHealthProbes(client, 'game-1');
    expect(result).toEqual([dataHealthProbeRecordFixture]);
    expect(fetchImplementation).toHaveBeenCalledWith(
      'http://localhost/api/v1/admin/data-health/games/game-1/probes',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('runs an explicit provider probe as a POST with no body', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ data: dataHealthProbeResultFixture })),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    const result = await runDataHealthProbe(client, 'game-1');
    expect(result).toEqual(dataHealthProbeResultFixture);
    expect(fetchImplementation).toHaveBeenCalledWith(
      'http://localhost/api/v1/admin/data-health/games/game-1/probe',
      expect.objectContaining({ method: 'POST' }),
    );
    const options = fetchImplementation.mock.calls[0]?.[1] as RequestInit;
    expect(options.body).toBeUndefined();
  });
});
