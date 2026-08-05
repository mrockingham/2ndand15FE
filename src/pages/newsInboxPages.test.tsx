import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { adminArticleFixture } from '@/test/articleFixtures';
import {
  apiErrorResponse,
  billsFixture,
  currentUserFixture,
  jsonResponse,
} from '@/test/authFixtures';
import {
  ingestionRunFixture,
  newsCandidateFixture,
  newsSourceDetailFixture,
  newsSourceFixture,
} from '@/test/newsInboxFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const admin = { ...currentUserFixture, role: 'ADMIN' as const };
const page = (data: readonly unknown[], nextCursor: string | null = null) =>
  jsonResponse({ data, meta: { nextCursor } });

describe('news source administration', () => {
  it('shows the editor navigation and a truthful source empty state without admin controls', async () => {
    const view = renderApp('/admin/news-sources', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(page([])),
    });
    expect(
      await screen.findByRole(
        'heading',
        { name: 'News sources' },
        { timeout: 5_000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No news feeds are configured'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Candidate inbox' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'New source' }),
    ).not.toBeInTheDocument();
    view.unmount();

    renderApp('/admin/news-sources/new', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(page([])),
    });
    expect(
      await screen.findByRole('heading', { name: 'News sources' }),
    ).toBeInTheDocument();
  });

  it('distinguishes read-only testing from confirmed ingestion and keeps definition controls admin-only', async () => {
    const user = userEvent.setup();
    const result = {
      sourceId: newsSourceFixture.id,
      sourceSlug: newsSourceFixture.slug,
      testedOnly: true,
      notModified: false,
      feedKind: 'RSS',
      run: ingestionRunFixture,
    };
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith(`/admin/news-sources/${newsSourceFixture.id}`))
        return Promise.resolve(jsonResponse({ data: newsSourceDetailFixture }));
      if (url.endsWith('/test'))
        return Promise.resolve(jsonResponse({ data: result }));
      if (url.endsWith('/ingest'))
        return Promise.resolve(
          jsonResponse({ data: { ...result, testedOnly: false } }),
        );
      return Promise.reject(new TypeError(`Unexpected ${init?.method} ${url}`));
    });
    const view = renderApp(`/admin/news-sources/${newsSourceFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByRole('heading', { name: newsSourceFixture.name }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit source' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pause' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Test source' }));
    expect(
      await screen.findByText('Read-only test; no candidates were created.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Run ingestion' }));
    const dialog = screen.getByRole('dialog', { name: 'Run ingestion now?' });
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).endsWith('/ingest'),
      ),
    ).toBe(false);
    await user.click(
      within(dialog).getByRole('button', { name: 'Run ingestion' }),
    );
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).endsWith('/ingest'),
        ),
      ).toBe(true),
    );
    view.unmount();

    renderApp(`/admin/news-sources/${newsSourceFixture.id}`, {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByRole('button', { name: 'Edit source' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('shows bounded rate-limit feedback', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input) =>
      String(input).endsWith('/test')
        ? Promise.resolve(
            apiErrorResponse('RATE_LIMITED', 'Internal details', 429),
          )
        : Promise.resolve(jsonResponse({ data: newsSourceDetailFixture })),
    );
    renderApp(`/admin/news-sources/${newsSourceFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await user.click(
      await screen.findByRole('button', { name: 'Test source' }),
    );
    expect(
      await screen.findByText(
        'The ingestion rate limit was reached. Wait before trying again.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Internal details')).not.toBeInTheDocument();
  });
});

describe('editorial candidate inbox', () => {
  it('filters and paginates candidate metadata', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/admin/news-sources?'))
        return Promise.resolve(page([newsSourceFixture]));
      if (url.endsWith('/teams')) return Promise.resolve(page([billsFixture]));
      if (url.includes('/admin/news-candidates?'))
        return Promise.resolve(
          page(
            [newsCandidateFixture],
            url.includes('cursor=next') ? null : 'next',
          ),
        );
      return Promise.reject(new TypeError(`Unexpected ${url}`));
    });
    renderApp('/admin/news-candidates', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByRole('heading', { name: 'Candidate inbox' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'NEW' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes('status=NEW'),
        ),
      ).toBe(true),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Load more candidates' }),
    );
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes('cursor=next'),
        ),
      ).toBe(true),
    );
  });

  it('keeps publisher copy plain, supports transitions, and starts conversion summary empty', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/teams')) return Promise.resolve(page([billsFixture]));
      if (url.endsWith(`/admin/news-candidates/${newsCandidateFixture.id}`))
        return Promise.resolve(jsonResponse({ data: newsCandidateFixture }));
      if (url.endsWith('/review') && init?.method === 'POST')
        return Promise.resolve(
          jsonResponse({
            data: { ...newsCandidateFixture, status: 'REVIEWING' },
          }),
        );
      return Promise.reject(new TypeError(`Unexpected ${init?.method} ${url}`));
    });
    renderApp(`/admin/news-candidates/${newsCandidateFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByRole('heading', {
        name: newsCandidateFixture.headline,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(newsCandidateFixture.sourceDescription ?? ''),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Publisher copy stays plain text.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open publisher article' }),
    ).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('textbox', { name: 'Original summary' }),
    ).toHaveValue('');
    expect(
      screen.getByText(/deterministic suggestions are starting points/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Begin review' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).endsWith('/review'),
        ),
      ).toBe(true),
    );
  });

  it('converts to a curated draft, never requests publication, and prevents repeat conversion', async () => {
    const user = userEvent.setup();
    const converted = {
      ...newsCandidateFixture,
      status: 'CONVERTED' as const,
      convertedArticleId: adminArticleFixture.id,
    };
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/teams')) return Promise.resolve(page([billsFixture]));
      if (url.endsWith(`/admin/news-candidates/${newsCandidateFixture.id}`))
        return Promise.resolve(jsonResponse({ data: newsCandidateFixture }));
      if (url.endsWith('/convert'))
        return Promise.resolve(
          jsonResponse({
            data: {
              candidate: converted,
              article: {
                ...adminArticleFixture,
                type: 'CURATED',
                status: 'DRAFT',
              },
            },
          }),
        );
      if (url.includes('/revisions?')) return Promise.resolve(page([]));
      return Promise.reject(new TypeError(`Unexpected ${init?.method} ${url}`));
    });
    const view = renderApp(
      `/admin/news-candidates/${newsCandidateFixture.id}`,
      {
        currentUser: editor,
        restorationStatus: 'authenticated',
        fetchImplementation,
      },
    );
    await user.type(
      await screen.findByRole('textbox', { name: 'Original summary' }),
      'Our original summary of the reporting.',
    );
    await user.click(
      screen.getByRole('button', { name: 'Create curated draft' }),
    );
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).endsWith('/convert'),
        ),
      ).toBe(true),
    );
    await waitFor(() =>
      expect(view.router.state.location.pathname).toBe(
        `/admin/articles/${adminArticleFixture.id}`,
      ),
    );
    expect(
      await screen.findByText(/was converted into this private curated draft/i),
    ).toBeInTheDocument();
    const conversionCall = fetchImplementation.mock.calls.find(([input]) =>
      String(input).endsWith('/convert'),
    );
    expect(JSON.parse(String(conversionCall?.[1]?.body))).toEqual(
      expect.objectContaining({
        originalSummary: 'Our original summary of the reporting.',
      }),
    );
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).endsWith('/publish'),
      ),
    ).toBe(false);
    view.unmount();

    renderApp(`/admin/news-candidates/${newsCandidateFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ data: converted })),
    });
    expect(
      await screen.findByText(
        'This candidate has been converted into a curated draft.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create curated draft' }),
    ).not.toBeInTheDocument();
  });
});
