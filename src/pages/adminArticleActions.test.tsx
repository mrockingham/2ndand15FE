import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAppQueryClient } from '@/app/queryClient';
import { adminArticleKeys, articleKeys } from '@/features/articles/queryKeys';
import type { AdminArticleListItem } from '@/features/articles/types';
import {
  adminArticleFixture,
  publicArticleDetailFixture,
  publicArticleFixture,
} from '@/test/articleFixtures';
import {
  apiErrorResponse,
  currentUserFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const admin = { ...currentUserFixture, role: 'ADMIN' as const };
const publishedArticle: AdminArticleListItem = {
  ...adminArticleFixture,
  status: 'PUBLISHED',
  publishedAt: '2026-08-02T15:00:00.000Z',
};

const articlePage = (articles: readonly AdminArticleListItem[]) =>
  jsonResponse({ data: articles, meta: { nextCursor: null } });

const createArticleRouter = (deleteStatus: 204 | 403 | 404 = 204) => {
  let article: AdminArticleListItem | null = publishedArticle;
  const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
    const url = String(input);
    if (url.endsWith('/teams'))
      return Promise.resolve(jsonResponse({ data: [] }));
    if (url.endsWith('/users/me'))
      return Promise.resolve(jsonResponse({ data: { user: admin } }));
    if (url.endsWith('/admin/homepage/top-stories'))
      return Promise.resolve(jsonResponse({ data: [] }));
    if (url.includes('/admin/articles?'))
      return Promise.resolve(articlePage(article ? [article] : []));
    if (url.endsWith('/unpublish') && init?.method === 'POST') {
      article = {
        ...publishedArticle,
        status: 'UNPUBLISHED',
        version: publishedArticle.version + 1,
      };
      return Promise.resolve(jsonResponse({ data: article }));
    }
    if (
      url.endsWith(`/admin/articles/${publishedArticle.id}`) &&
      init?.method === 'DELETE'
    ) {
      if (deleteStatus === 403)
        return Promise.resolve(
          apiErrorResponse('ADMIN_PERMISSION_REQUIRED', 'Unsafe detail', 403),
        );
      article = null;
      if (deleteStatus === 404)
        return Promise.resolve(
          apiErrorResponse('ARTICLE_NOT_FOUND', 'Unsafe detail', 404),
        );
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });
  return fetchImplementation;
};

const openActions = async (user: ReturnType<typeof userEvent.setup>) => {
  const buttons = await screen.findAllByRole('button', {
    name: `Open actions for ${publishedArticle.title}`,
  });
  await user.click(buttons[0]);
};

describe('Admin Article actions', () => {
  it('shows Unpublish to EDITOR users but never renders permanent deletion', async () => {
    const user = userEvent.setup();
    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: createArticleRouter(),
    });

    await openActions(user);
    expect(
      screen.getByRole('menuitem', { name: 'Unpublish' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Delete permanently' }),
    ).not.toBeInTheDocument();
  });

  it('shows permanent deletion to ADMIN users', async () => {
    const user = userEvent.setup();
    renderApp('/admin/articles', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: createArticleRouter(),
    });

    await openActions(user);
    expect(
      screen.getByRole('menuitem', { name: 'Delete permanently' }),
    ).toBeInTheDocument();
  });

  it('opens the destructive confirmation and cancel performs no request', async () => {
    const user = userEvent.setup();
    const fetchImplementation = createArticleRouter();
    renderApp('/admin/articles', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await openActions(user);
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete permanently' }),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Permanently delete this article?',
    });
    expect(
      within(dialog).getByText(publishedArticle.title),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('This cannot be undone.'),
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(
      fetchImplementation.mock.calls.some(
        ([, init]) => init?.method === 'DELETE',
      ),
    ).toBe(false);
  });

  it('confirms DELETE, handles 204, and evicts admin and public article state', async () => {
    const user = userEvent.setup();
    const fetchImplementation = createArticleRouter();
    const queryClient = createAppQueryClient();
    queryClient.setQueryData(
      adminArticleKeys.detail(publishedArticle.id),
      adminArticleFixture,
    );
    queryClient.setQueryData(
      articleKeys.detail(publishedArticle.slug),
      publicArticleDetailFixture,
    );
    queryClient.setQueryData(articleKeys.list({ limit: 20 }), {
      articles: [publicArticleFixture],
      nextCursor: null,
    });
    renderApp('/admin/articles', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation,
      queryClient,
    });

    await openActions(user);
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete permanently' }),
    );
    await user.click(
      within(
        screen.getByRole('dialog', {
          name: 'Permanently delete this article?',
        }),
      ).getByRole('button', { name: 'Delete permanently' }),
    );

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([input, init]) =>
            String(input).endsWith(`/admin/articles/${publishedArticle.id}`) &&
            init?.method === 'DELETE' &&
            init.body === undefined,
        ),
      ).toBe(true),
    );
    expect(
      await screen.findByText('Article permanently deleted.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'No articles found' }),
    ).toBeInTheDocument();
    expect(
      queryClient.getQueryData(adminArticleKeys.detail(publishedArticle.id)),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(articleKeys.detail(publishedArticle.slug)),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(articleKeys.list({ limit: 20 })),
    ).toBeUndefined();
  });

  it('surfaces a clear 403 permission error and keeps the article', async () => {
    const user = userEvent.setup();
    renderApp('/admin/articles', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: createArticleRouter(403),
    });

    await openActions(user);
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete permanently' }),
    );
    await user.click(
      within(
        screen.getByRole('dialog', {
          name: 'Permanently delete this article?',
        }),
      ).getByRole('button', { name: 'Delete permanently' }),
    );
    expect(
      await screen.findByText(
        /does not have permission for this editorial action/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(publishedArticle.title).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText('Unsafe detail')).not.toBeInTheDocument();
  });

  it('treats a delete 404 as already gone and cleans up local state', async () => {
    const user = userEvent.setup();
    renderApp('/admin/articles', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: createArticleRouter(404),
    });

    await openActions(user);
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete permanently' }),
    );
    await user.click(
      within(
        screen.getByRole('dialog', {
          name: 'Permanently delete this article?',
        }),
      ).getByRole('button', { name: 'Delete permanently' }),
    );
    expect(
      await screen.findByText('Article was already permanently deleted.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'No articles found' }),
    ).toBeInTheDocument();
  });

  it('keeps versioned unpublish working from the article menu', async () => {
    const user = userEvent.setup();
    const fetchImplementation = createArticleRouter();
    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await openActions(user);
    await user.click(screen.getByRole('menuitem', { name: 'Unpublish' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Unpublish this article?',
    });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Change summary' }),
      'Needs another review.',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Unpublish' }));

    await waitFor(() => {
      const call = fetchImplementation.mock.calls.find(([input]) =>
        String(input).endsWith('/unpublish'),
      );
      expect(JSON.parse(String(call?.[1]?.body))).toEqual({
        expectedVersion: publishedArticle.version,
        changeSummary: 'Needs another review.',
      });
    });
    expect(await screen.findByText('Article unpublished.')).toBeInTheDocument();
  });
});
