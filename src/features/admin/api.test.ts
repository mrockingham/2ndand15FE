import {
  createAdminGame,
  deleteGameOverride,
  listAdminGames,
  listAuditEvents,
  validateScheduleImport,
} from '@/features/admin/api';
import { createApiClient } from '@/services/api/apiClient';
import { adminGameFixture } from '@/test/adminFixtures';
import { jsonResponse } from '@/test/authFixtures';

describe('administrative API boundary', () => {
  it('uses deterministic bounded list query parameters and bearer auth', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: [adminGameFixture], meta: { nextCursor: null } }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    await expect(
      listAdminGames(client, {
        season: 2026,
        limit: 50,
        cursor: adminGameFixture.id,
      }),
    ).resolves.toEqual({ games: [adminGameFixture], nextCursor: null });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining(
        `/admin/games?season=2026&limit=50&cursor=${adminGameFixture.id}`,
      ),
      expect.objectContaining({ method: 'GET', headers: expect.any(Headers) }),
    );
    const headers = fetchImplementation.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token');
  });

  it('matches create, override deletion, import validation, and audit contracts', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ data: adminGameFixture }, 201))
      .mockResolvedValueOnce(jsonResponse({ data: adminGameFixture }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            dryRun: true,
            received: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            warnings: 0,
            failed: 0,
            failures: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: [], meta: { nextCursor: null } }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    const createInput = {
      season: 2026,
      seasonType: 'REG' as const,
      week: 1,
      startTime: '2026-09-11T00:20:00Z',
      status: 'SCHEDULED' as const,
      homeTeamId: adminGameFixture.base.homeTeam.id,
      awayTeamId: adminGameFixture.base.awayTeam.id,
      venueName: null,
      venueCity: null,
      broadcastNetwork: null,
      isNeutralSite: false,
      provenance: { sourceName: 'Manual' },
    };
    await createAdminGame(client, createInput);
    await deleteGameOverride(client, adminGameFixture.id);
    await validateScheduleImport(client, []);
    await listAuditEvents(client, {
      entityType: 'GAME',
      entityId: adminGameFixture.id,
      limit: 25,
    });
    expect(
      fetchImplementation.mock.calls.map(([input, init]) => [
        String(input),
        init?.method,
      ]),
    ).toEqual([
      ['http://localhost/api/v1/admin/games', 'POST'],
      [
        `http://localhost/api/v1/admin/games/${adminGameFixture.id}/override`,
        'DELETE',
      ],
      ['http://localhost/api/v1/admin/schedule-imports/validate', 'POST'],
      [
        `http://localhost/api/v1/admin/audit-events?entityType=GAME&entityId=${adminGameFixture.id}&limit=25`,
        'GET',
      ],
    ]);
  });
});
