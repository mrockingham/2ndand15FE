import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  adminArticleFixture,
  articleRevisionFixture,
  publicArticleDetailFixture,
  publicArticleFixture,
} from '@/test/articleFixtures';
import {
  apiErrorResponse,
  billsFixture,
  currentUserFixture,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const admin = { ...currentUserFixture, role: 'ADMIN' as const };
const page = (data: readonly unknown[], nextCursor: string | null = null) =>
  jsonResponse({ data, meta: { nextCursor } });

describe('public News experience', () => {
  it('filters the feed without sending an invalid one-character search', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      return Promise.resolve(
        page(
          [publicArticleFixture],
          url.includes('/articles/featured') ? null : 'next-article-cursor',
        ),
      );
    });
    renderApp('/news', {
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByRole('heading', { name: 'News' }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(publicArticleFixture.title)).toHaveLength(
      2,
    );
    expect(
      screen.getByRole('heading', { name: 'Featured' }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search news'), 'c');
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('search=c'),
      ),
    ).toBe(false);
    await user.type(screen.getByLabelText('Search news'), 'a');
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes('search=ca'),
        ),
      ).toBe(true),
    );
    await user.click(screen.getByRole('combobox', { name: 'Article type' }));
    await user.click(screen.getByRole('option', { name: 'Curated' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes('type=CURATED'),
        ),
      ).toBe(true),
    );
    await user.click(screen.getByRole('button', { name: 'My team: BUF' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes(`teamId=${billsFixture.id}`),
        ),
      ).toBe(true),
    );
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([input]) =>
          String(input).includes('cursor=next-article-cursor'),
        ),
      ).toBe(true),
    );
  });

  it('renders safe public detail and a deliberate 404 state', async () => {
    const detailRender = renderApp(`/news/${publicArticleFixture.slug}`, {
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ data: publicArticleDetailFixture })),
    });
    expect(
      await screen.findByRole('heading', {
        name: publicArticleDetailFixture.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('What stood out')).toBeInTheDocument();
    detailRender.unmount();

    renderApp('/news/unavailable-story', {
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          apiErrorResponse('ARTICLE_NOT_FOUND', 'Internal detail', 404),
        ),
    });
    expect(
      await screen.findByRole('heading', { name: 'Article not found' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Internal detail')).not.toBeInTheDocument();
  });
});

describe('editorial administration', () => {
  const adminRouter = (role: 'EDITOR' | 'ADMIN') =>
    vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/teams')) return Promise.resolve(page([billsFixture]));
      if (url.includes('/admin/articles?'))
        return Promise.resolve(page([adminArticleFixture]));
      if (url.includes('/revisions?'))
        return Promise.resolve(page([articleRevisionFixture]));
      if (url.endsWith(`/revisions/${articleRevisionFixture.id}`))
        return Promise.resolve(jsonResponse({ data: articleRevisionFixture }));
      if (url.includes('/admin/audit-events')) return Promise.resolve(page([]));
      if (
        url.endsWith(`/admin/articles/${adminArticleFixture.id}`) &&
        init?.method !== 'PATCH'
      )
        return Promise.resolve(jsonResponse({ data: adminArticleFixture }));
      if (url.endsWith('/publish') && init?.method === 'POST')
        return Promise.resolve(
          jsonResponse({
            data: {
              ...adminArticleFixture,
              status: 'PUBLISHED',
              version: adminArticleFixture.version + 1,
              publishedAt: '2026-08-02T15:00:00.000Z',
            },
          }),
        );
      if (
        url.endsWith(`/admin/articles/${adminArticleFixture.id}`) &&
        init?.method === 'PATCH'
      )
        return Promise.resolve(
          apiErrorResponse(
            'ARTICLE_VERSION_CONFLICT',
            'Unsafe conflict detail',
            409,
          ),
        );
      return Promise.reject(
        new TypeError(`Unexpected ${role} request: ${url}`),
      );
    });

  it('denies regular users and gives editors an Articles workspace', async () => {
    const denied = renderApp('/admin/articles', {
      currentUser: currentUserFixture,
      restorationStatus: 'authenticated',
    });
    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    denied.unmount();

    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter('EDITOR'),
    });
    expect(
      await screen.findByRole('heading', { name: 'Articles' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New article' })).toHaveAttribute(
      'href',
      '/admin/articles/new',
    );
    expect(
      (await screen.findAllByText(adminArticleFixture.title)).length,
    ).toBeGreaterThan(0);
  });

  it('uses article versions for publishing and keeps archive controls admin-only', async () => {
    const user = userEvent.setup();
    const fetchImplementation = adminRouter('EDITOR');
    const editorRender = renderApp(
      `/admin/articles/${adminArticleFixture.id}`,
      {
        currentUser: editor,
        restorationStatus: 'authenticated',
        fetchImplementation,
      },
    );
    expect(
      await screen.findByRole('heading', { name: 'Revision history' }),
    ).toBeInTheDocument();
    const title = screen.getByRole('textbox', { name: /^Title/ });
    await user.clear(title);
    await user.type(title, 'Unsaved local headline');
    await user.click(screen.getByRole('button', { name: 'Save article' }));
    expect(
      await screen.findByText(/Another editor changed this article/i),
    ).toBeInTheDocument();
    expect(title).toHaveValue('Unsaved local headline');
    expect(
      screen.queryByText('Unsafe conflict detail'),
    ).not.toBeInTheDocument();
    const patchCall = fetchImplementation.mock.calls.find(
      ([, init]) => init?.method === 'PATCH',
    );
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual(
      expect.objectContaining({ expectedVersion: 4 }),
    );
    expect(await screen.findByText('Revision 4')).toBeInTheDocument();
    await user.click(screen.getByText('Revision 4'));
    await user.click(
      await screen.findByRole('button', { name: 'Open revision' }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Revision 4' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: /Revision/ }),
    );
    expect(
      screen.queryByRole('button', { name: 'Archive' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish now' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm publish' });
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      const call = fetchImplementation.mock.calls.find(([input]) =>
        String(input).endsWith('/publish'),
      );
      expect(JSON.parse(String(call?.[1]?.body))).toEqual(
        expect.objectContaining({ expectedVersion: 4 }),
      );
    });
    editorRender.unmount();

    renderApp(`/admin/articles/${adminArticleFixture.id}`, {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter('ADMIN'),
    });
    expect(
      await screen.findByRole('button', { name: 'Archive' }),
    ).toBeInTheDocument();
  }, 10_000);

  it('blocks malformed or past scheduling before any request is sent', async () => {
    const user = userEvent.setup();
    const fetchImplementation = adminRouter('EDITOR');
    renderApp(`/admin/articles/${adminArticleFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await user.click(await screen.findByRole('button', { name: 'Schedule' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Confirm schedule',
    });
    await user.type(
      within(dialog).getByRole('textbox', {
        name: /Scheduled publication timestamp/,
      }),
      '2020-01-01T10:00:00-04:00',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(
      await screen.findByText('Scheduled publication must be in the future.'),
    ).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).endsWith('/schedule'),
      ),
    ).toBe(false);
  });
});
