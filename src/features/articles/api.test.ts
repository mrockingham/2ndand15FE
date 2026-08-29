import {
  deleteArticle,
  getPublicArticle,
  listPublicArticles,
  replaceArticleTeams,
  scheduleArticle,
  transitionArticle,
  updateArticle,
} from '@/features/articles/api';
import { createApiClient } from '@/services/api/apiClient';
import {
  adminArticleFixture,
  publicArticleDetailFixture,
  publicArticleFixture,
} from '@/test/articleFixtures';
import { jsonResponse } from '@/test/authFixtures';

describe('article HTTP boundary', () => {
  it('permanently deletes through the admin endpoint and accepts an empty 204 response', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'access-token',
    });

    await expect(
      deleteArticle(client, adminArticleFixture.id),
    ).resolves.toBeUndefined();
    expect(fetchImplementation).toHaveBeenCalledWith(
      `http://localhost:3000/api/v1/admin/articles/${adminArticleFixture.id}`,
      expect.objectContaining({ method: 'DELETE', body: undefined }),
    );
  });

  it('uses public endpoints and preserves their intentionally limited DTOs', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/articles?')) {
        return Promise.resolve(
          jsonResponse({
            data: [publicArticleFixture],
            meta: { nextCursor: 'next-article-id' },
          }),
        );
      }
      return Promise.resolve(
        jsonResponse({ data: publicArticleDetailFixture }),
      );
    });
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
    });

    const page = await listPublicArticles(client, {
      limit: 20,
      team: 'BUF',
      featured: true,
      search: 'camp',
    });
    const detail = await getPublicArticle(client, publicArticleFixture.slug);

    expect(page).toEqual({
      articles: [publicArticleFixture],
      nextCursor: 'next-article-id',
    });
    expect(detail).not.toHaveProperty('status');
    expect(detail).not.toHaveProperty('version');
    expect(fetchImplementation.mock.calls[0]?.[0]).toContain(
      '/articles?limit=20&team=BUF&featured=true&search=camp',
    );
    expect(fetchImplementation.mock.calls[1]?.[0]).toContain(
      `/articles/${publicArticleFixture.slug}`,
    );
  });

  it('sends expectedVersion on edits, team replacement, and lifecycle actions', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ data: adminArticleFixture })),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'access-token',
    });

    await updateArticle(client, adminArticleFixture.id, {
      expectedVersion: 4,
      title: 'Revised title',
    });
    await replaceArticleTeams(client, adminArticleFixture.id, {
      expectedVersion: 4,
      teamIds: [publicArticleFixture.teams[0].id],
    });
    await transitionArticle(client, adminArticleFixture.id, 'publish', {
      expectedVersion: 4,
      changeSummary: 'Ready for readers.',
    });
    await scheduleArticle(client, adminArticleFixture.id, {
      expectedVersion: 4,
      scheduledFor: '2027-08-03T10:00:00-04:00',
    });

    expect(
      fetchImplementation.mock.calls.map(([input, init]) => ({
        url: String(input),
        method: init?.method,
        body: JSON.parse(String(init?.body)) as unknown,
      })),
    ).toEqual([
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({ expectedVersion: 4 }),
      }),
      expect.objectContaining({
        method: 'PUT',
        body: expect.objectContaining({ expectedVersion: 4 }),
      }),
      expect.objectContaining({
        url: expect.stringContaining('/publish'),
        body: expect.objectContaining({ expectedVersion: 4 }),
      }),
      expect.objectContaining({
        url: expect.stringContaining('/schedule'),
        body: expect.objectContaining({
          expectedVersion: 4,
          scheduledFor: '2027-08-03T10:00:00-04:00',
        }),
      }),
    ]);
  });
});
