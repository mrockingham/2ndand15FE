import {
  addEditorialPlacement,
  addHighlightPlacement,
  getAdminTeamHomepage,
  listEditorialCandidates,
  listHighlightCandidates,
  removeEditorialPlacement,
  removeHighlightPlacement,
  reorderEditorialPlacements,
  reorderHighlightPlacements,
  updateEditorialPlacement,
  updateTeamHighlightSettings,
  updateTeamHomepageBanner,
} from '@/features/teamHomepage/api';
import { createApiClient } from '@/services/api/apiClient';
import { billsFixture, jsonResponse } from '@/test/authFixtures';

const placementId = '30000000-0000-4000-8000-000000000001';
const sourceId = '30000000-0000-4000-8000-000000000002';

describe('Team Homepage Admin API', () => {
  it('uses the exact M39A team-scoped paths, verbs, and payloads', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((_input, init) => {
      if (init?.method === 'DELETE')
        return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(
        jsonResponse({ data: { items: [], nextCursor: null } }),
      );
    });
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });

    await getAdminTeamHomepage(client, billsFixture.id);
    await updateTeamHomepageBanner(client, billsFixture.id, {
      imageUrl: 'https://res.cloudinary.com/example/banner.jpg',
      focalX: 25,
      focalY: 60,
      overlayOpacity: 40,
    });
    await listEditorialCandidates(client, billsFixture.id, undefined, '25');
    await addEditorialPlacement(client, billsFixture.id, {
      sourceType: 'VIDEO',
      sourceId,
      mediaSourceType: 'CURATED_GAME_VIDEO',
      isLeadReplacement: true,
    });
    await updateEditorialPlacement(client, billsFixture.id, placementId, true);
    await reorderEditorialPlacements(client, billsFixture.id, {
      placementIds: [placementId],
    });
    await removeEditorialPlacement(client, billsFixture.id, placementId);
    await listHighlightCandidates(client, billsFixture.id, undefined, '50');
    await addHighlightPlacement(client, billsFixture.id, {
      sourceType: 'GAME_HIGHLIGHT',
      sourceId,
    });
    await updateTeamHighlightSettings(client, billsFixture.id, {
      displayLimit: 8,
      fillWithAutomatic: false,
    });
    await reorderHighlightPlacements(client, billsFixture.id, {
      placementIds: [placementId],
    });
    await removeHighlightPlacement(client, billsFixture.id, placementId);

    const calls = fetchImplementation.mock.calls.map(([input, init]) => ({
      url: String(input),
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }));
    const base = `/api/v1/admin/teams/${billsFixture.id}/homepage`;
    expect(
      calls.map(({ url, method }) => ({
        url: new URL(url).pathname + new URL(url).search,
        method,
      })),
    ).toEqual([
      { url: base, method: 'GET' },
      { url: `${base}/banner`, method: 'PUT' },
      { url: `${base}/editorial-candidates?limit=25&cursor=25`, method: 'GET' },
      { url: `${base}/editorial`, method: 'POST' },
      { url: `${base}/editorial/${placementId}`, method: 'PUT' },
      { url: `${base}/editorial/order`, method: 'PUT' },
      { url: `${base}/editorial/${placementId}`, method: 'DELETE' },
      { url: `${base}/highlight-candidates?limit=25&cursor=50`, method: 'GET' },
      { url: `${base}/highlights`, method: 'POST' },
      { url: `${base}/highlights/settings`, method: 'PUT' },
      { url: `${base}/highlights/order`, method: 'PUT' },
      { url: `${base}/highlights/${placementId}`, method: 'DELETE' },
    ]);
    expect(calls[1]!.body).toEqual({
      imageUrl: 'https://res.cloudinary.com/example/banner.jpg',
      focalX: 25,
      focalY: 60,
      overlayOpacity: 40,
    });
    expect(calls[3]!.body).toEqual({
      sourceType: 'VIDEO',
      sourceId,
      mediaSourceType: 'CURATED_GAME_VIDEO',
      isLeadReplacement: true,
    });
    expect(calls[4]!.body).toEqual({ isLeadReplacement: true });
    expect(calls[8]!.body).toEqual({ sourceType: 'GAME_HIGHLIGHT', sourceId });
    expect(calls[9]!.body).toEqual({
      displayLimit: 8,
      fillWithAutomatic: false,
    });
  });
});
