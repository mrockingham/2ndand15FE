import {
  addHighlightPlacement,
  deleteHighlightPlacement,
  listAdminHighlights,
  listHighlightCandidates,
  reorderHighlightPlacements,
  updateHighlightSettings,
} from '@/features/homepage/api';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';
import {
  adminHighlightFixture,
  highlightCandidateFixture,
  highlightSettingsFixture,
} from '@/test/homepageFixtures';

describe('homepage highlights admin HTTP boundary', () => {
  it('lists highlight candidates with query filters and cursor', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: { candidates: [highlightCandidateFixture], nextCursor: 'next' },
      }),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    const page = await listHighlightCandidates(
      client,
      { limit: 25, mediaType: 'GAME_HIGHLIGHT' },
      undefined,
      'cursor-1',
    );

    expect(page).toEqual({
      candidates: [highlightCandidateFixture],
      nextCursor: 'next',
    });
    const url = String(fetchImplementation.mock.calls[0]?.[0]);
    expect(url).toContain('/admin/homepage/highlight-candidates?');
    expect(url).toContain('mediaType=GAME_HIGHLIGHT');
    expect(url).toContain('cursor=cursor-1');
  });

  it('lists admin highlights as placements + settings', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: {
          placements: [adminHighlightFixture],
          settings: highlightSettingsFixture,
        },
      }),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    const result = await listAdminHighlights(client);

    expect(result).toEqual({
      placements: [adminHighlightFixture],
      settings: highlightSettingsFixture,
    });
    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      '/admin/homepage/highlights',
    );
  });

  it('adds a highlight placement with sourceType/sourceId', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: adminHighlightFixture }, 201));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    await addHighlightPlacement(client, {
      sourceType: 'GAME_HIGHLIGHT',
      sourceId: 'source-1',
    });

    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(request?.method).toBe('POST');
    expect(JSON.parse(String(request?.body))).toEqual({
      sourceType: 'GAME_HIGHLIGHT',
      sourceId: 'source-1',
    });
  });

  it('reorders highlight placements with the exact ordered placementIds array', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: [adminHighlightFixture] }));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    await reorderHighlightPlacements(client, {
      placementIds: ['id-1', 'id-2', 'id-3'],
    });

    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(request?.method).toBe('PUT');
    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      '/admin/homepage/highlights/order',
    );
    expect(JSON.parse(String(request?.body))).toEqual({
      placementIds: ['id-1', 'id-2', 'id-3'],
    });
  });

  it('updates highlight settings', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: highlightSettingsFixture }));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    await updateHighlightSettings(client, { displayLimit: 3 });

    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(request?.method).toBe('PUT');
    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      '/admin/homepage/highlights/settings',
    );
    expect(JSON.parse(String(request?.body))).toEqual({ displayLimit: 3 });
  });

  it('deletes a highlight placement by id', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    await deleteHighlightPlacement(client, adminHighlightFixture.id);

    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(request?.method).toBe('DELETE');
    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      `/admin/homepage/highlights/${adminHighlightFixture.id}`,
    );
  });
});
