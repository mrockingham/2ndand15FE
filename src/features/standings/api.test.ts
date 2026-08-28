import { getStandings } from '@/features/standings/api';
import { standingsKeys } from '@/features/standings/queryKeys';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';
import { standingsResponseFixture } from '@/test/standingsFixtures';

describe('standings API and query keys', () => {
  it('sends only the exact public M40A filters', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(standingsResponseFixture('league')));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
    });
    const filters = {
      season: 2026,
      seasonType: 'PRE',
      view: 'league',
    } as const;

    await getStandings(client, filters);

    const url = new URL(String(fetchImplementation.mock.calls[0]![0]));
    expect(url.pathname).toBe('/api/v1/standings');
    expect(url.searchParams.toString()).toBe(
      'season=2026&seasonType=PRE&view=league',
    );
    expect(standingsKeys.view(filters)).toEqual([
      'standings',
      2026,
      'PRE',
      'league',
    ]);
  });
});
