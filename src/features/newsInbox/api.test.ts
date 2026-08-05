import {
  createManualCandidate,
  dismissCandidate,
  listNewsCandidates,
  listNewsSources,
  runNewsIngestion,
  transitionCandidate,
} from '@/features/newsInbox/api';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';
import {
  ingestionRunFixture,
  newsCandidateFixture,
  newsSourceFixture,
} from '@/test/newsInboxFixtures';

describe('news inbox HTTP boundary', () => {
  it('uses backend filters, cursors, and exact action paths', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/news-sources?'))
        return Promise.resolve(
          jsonResponse({
            data: [newsSourceFixture],
            meta: { nextCursor: 'source-cursor' },
          }),
        );
      if (url.includes('/news-candidates?'))
        return Promise.resolve(
          jsonResponse({
            data: [newsCandidateFixture],
            meta: { nextCursor: 'candidate-cursor' },
          }),
        );
      if (url.endsWith('/test'))
        return Promise.resolve(
          jsonResponse({
            data: {
              sourceId: newsSourceFixture.id,
              sourceSlug: newsSourceFixture.slug,
              testedOnly: true,
              notModified: false,
              feedKind: 'RSS',
              run: ingestionRunFixture,
            },
          }),
        );
      return Promise.resolve(jsonResponse({ data: newsCandidateFixture }));
    });
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });
    await listNewsSources(
      client,
      { limit: 25, status: 'ACTIVE', kind: 'RSS' },
      undefined,
      'source-page',
    );
    await listNewsCandidates(
      client,
      {
        limit: 25,
        status: 'NEW',
        sourceId: newsSourceFixture.id,
        search: 'camp',
      },
      undefined,
      'candidate-page',
    );
    await runNewsIngestion(client, newsSourceFixture.id, 'test');
    await transitionCandidate(client, newsCandidateFixture.id, 'review');
    await dismissCandidate(client, newsCandidateFixture.id, 'Not relevant');
    await createManualCandidate(client, {
      url: 'https://news.example.com/manual',
      headline: 'Manual story',
      sourceName: 'Example News',
      sourceId: null,
      sourceDescription: null,
      sourceAuthor: null,
      sourcePublishedAt: null,
      suggestedTeamIds: [],
    });
    const calls = fetchImplementation.mock.calls.map(([input, init]) => ({
      url: String(input),
      method: init?.method,
      body: init?.body ? (JSON.parse(String(init.body)) as unknown) : undefined,
    }));
    expect(calls[0]?.url).toContain(
      'limit=25&status=ACTIVE&kind=RSS&cursor=source-page',
    );
    expect(calls[1]?.url).toContain(
      `status=NEW&sourceId=${newsSourceFixture.id}&search=camp&cursor=candidate-page`,
    );
    expect(calls[2]).toEqual(
      expect.objectContaining({
        url: expect.stringContaining('/test'),
        method: 'POST',
        body: {},
      }),
    );
    expect(calls[3]?.url).toContain('/review');
    expect(calls[4]).toEqual(
      expect.objectContaining({
        url: expect.stringContaining('/dismiss'),
        body: { reason: 'Not relevant' },
      }),
    );
    expect(calls[5]?.url).toContain('/news-candidates/manual');
  });
});
