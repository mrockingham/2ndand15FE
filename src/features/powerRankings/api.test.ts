import { importPowerRankings } from '@/features/powerRankings/api';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';

describe('Power Rankings Admin API — import request shape', () => {
  it('sends exactly { data, mode, publish } for a PREVIEW request', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse({
          data: {
            mode: 'PREVIEW',
            season: 2026,
            edition: 'preseason',
            asOf: '2026-08-30',
            foundCount: 32,
            matchedTeams: 32,
            errors: [],
            warnings: [],
          },
        }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const document = { season: 2026, edition: 'preseason', rankings: [] };

    await importPowerRankings(client, { mode: 'PREVIEW', data: document });

    const [, init] = fetchImplementation.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      data: document,
      mode: 'PREVIEW',
      publish: false,
    });
  });

  it('sends exactly { data, mode, publish } for an UPSERT request', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse({
          data: {
            mode: 'UPSERT',
            season: 2026,
            edition: 'preseason',
            asOf: '2026-08-30',
            foundCount: 32,
            matchedTeams: 32,
            errors: [],
            warnings: [],
          },
        }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const document = { season: 2026, edition: 'preseason', rankings: [] };

    await importPowerRankings(client, { mode: 'UPSERT', data: document });

    const [, init] = fetchImplementation.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      data: document,
      mode: 'UPSERT',
      publish: false,
    });
  });
});
