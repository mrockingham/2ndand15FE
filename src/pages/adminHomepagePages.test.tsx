import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { currentUserFixture, jsonResponse } from '@/test/authFixtures';
import {
  adminArticleListItemFixture,
  adminHeroListFixture,
  adminHeroSlideFixture,
  adminTopStoryFixture,
} from '@/test/homepageFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Admin Homepage — Hero carousel', () => {
  it('lists slides with status/reorder/delete controls and creates a new slide', async () => {
    const user = userEvent.setup();
    let slides = [adminHeroSlideFixture];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (
        url.endsWith('/admin/homepage/hero') &&
        (!init || init.method === undefined || init.method === 'GET')
      )
        return Promise.resolve(
          jsonResponse({
            data: {
              slides,
              meta: {
                activeCount: slides.length,
                totalCount: slides.length,
                readyForPublish: false,
              },
            },
          }),
        );
      if (
        url.endsWith('/admin/homepage/top-stories') &&
        (!init || init.method === 'GET')
      )
        return Promise.resolve(jsonResponse({ data: [] }));
      if (url.endsWith('/admin/homepage/hero') && init?.method === 'POST') {
        const created = {
          ...adminHeroSlideFixture,
          id: 'new-slide-id',
          position: slides.length,
          imageUrl: 'https://static.example.com/new.jpg',
          contentBlocks: [],
          ctas: [],
        };
        slides = [...slides, created];
        return Promise.resolve(jsonResponse({ data: created }, 201));
      }
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByRole('heading', { name: 'Hero Carousel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('1 / 10 slides · Needs 2 more active slides'),
    ).toBeInTheDocument();
    expect(screen.getByText('Football. Smarter. Faster.')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Add Slide' }));
    expect(
      await screen.findByRole('heading', { name: 'Add Hero Slide' }),
    ).toBeInTheDocument();

    const imageUrlField = screen.getByLabelText('Image URL *');
    await user.type(imageUrlField, 'https://static.example.com/new.jpg');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/hero') &&
            reqInit?.method === 'POST',
        ),
      ).toBe(true),
    );
  });

  it('moves a slide down and deletes a slide with confirmation', async () => {
    const user = userEvent.setup();
    const secondSlide = {
      ...adminHeroSlideFixture,
      id: 'second-slide',
      position: 1,
    };
    let slides = [adminHeroSlideFixture, secondSlide];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/admin/homepage/top-stories'))
        return Promise.resolve(jsonResponse({ data: [] }));
      if (
        url.endsWith('/admin/homepage/hero/order') &&
        init?.method === 'PUT'
      ) {
        const { slideIds } = JSON.parse(String(init.body)) as {
          slideIds: string[];
        };
        slides = slideIds.map((id, index) => ({
          ...slides.find((slide) => slide.id === id)!,
          position: index,
        }));
        return Promise.resolve(
          jsonResponse({
            data: {
              slides,
              meta: { activeCount: 2, totalCount: 2, readyForPublish: false },
            },
          }),
        );
      }
      if (url.includes('/admin/homepage/hero/') && init?.method === 'DELETE') {
        const id = url.split('/').pop()!;
        slides = slides.filter((slide) => slide.id !== id);
        return Promise.resolve(
          jsonResponse({
            data: {
              slides,
              meta: {
                activeCount: slides.length,
                totalCount: slides.length,
                readyForPublish: false,
              },
            },
          }),
        );
      }
      if (url.endsWith('/admin/homepage/hero'))
        return Promise.resolve(
          jsonResponse({
            data: {
              slides,
              meta: { activeCount: 2, totalCount: 2, readyForPublish: false },
            },
          }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await screen.findByRole('heading', { name: 'Hero Carousel' });
    const moveDown = screen.getByRole('button', { name: 'Move slide 1 down' });
    await user.click(moveDown);
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/hero/order') &&
            reqInit?.method === 'PUT',
        ),
      ).toBe(true),
    );

    const deleteButtons = screen.getAllByRole('button', {
      name: /^Delete slide/,
    });
    await user.click(deleteButtons[0]);
    expect(await screen.findByText('Delete Hero slide?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete slide' }));
    await waitFor(() =>
      expect(screen.queryByText('Delete Hero slide?')).not.toBeInTheDocument(),
    );
  });
});

describe('Admin Homepage — Top Stories', () => {
  it('shows the lead story first and reorders/removes stories', async () => {
    const user = userEvent.setup();
    const secondStory = {
      id: 'top-story-2',
      position: 1,
      article: {
        ...adminArticleListItemFixture,
        id: 'second-article',
        title: 'Second story',
      },
    };
    let stories = [adminTopStoryFixture, secondStory];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/admin/homepage/hero'))
        return Promise.resolve(jsonResponse({ data: adminHeroListFixture }));
      if (
        url.endsWith('/admin/homepage/top-stories/order') &&
        init?.method === 'PUT'
      ) {
        const { articleIds } = JSON.parse(String(init.body)) as {
          articleIds: string[];
        };
        stories = articleIds.map((id, index) => ({
          ...stories.find((story) => story.article.id === id)!,
          position: index,
        }));
        return Promise.resolve(jsonResponse({ data: stories }));
      }
      if (
        url.includes('/admin/homepage/top-stories/') &&
        init?.method === 'DELETE'
      ) {
        const id = url.split('/').pop()!;
        stories = stories.filter((story) => story.article.id !== id);
        return Promise.resolve(json(null, 204));
      }
      if (url.endsWith('/admin/homepage/top-stories'))
        return Promise.resolve(jsonResponse({ data: stories }));
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByRole('heading', { name: 'Top Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(
      screen.getByText(adminArticleListItemFixture.title),
    ).toBeInTheDocument();
    expect(screen.getByText('Second story')).toBeInTheDocument();

    const moveDown = screen.getByRole('button', {
      name: `Move ${adminArticleListItemFixture.title} down`,
    });
    await user.click(moveDown);
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/top-stories/order') &&
            reqInit?.method === 'PUT',
        ),
      ).toBe(true),
    );

    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    await user.click(removeButtons[0]);
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([, reqInit]) => reqInit?.method === 'DELETE',
        ),
      ).toBe(true),
    );
  });
});

describe('Admin Articles — Top Story checkbox', () => {
  const buildRouter = (
    topStoriesCount: number,
    {
      includeVisibleArticle = true,
    }: { readonly includeVisibleArticle?: boolean } = {},
  ) => {
    const stories = Array.from({ length: topStoriesCount }, (_, index) => ({
      id: `top-story-${String(index)}`,
      position: index,
      article: {
        ...adminArticleListItemFixture,
        id:
          index === 0 && includeVisibleArticle
            ? adminArticleListItemFixture.id
            : `other-article-${String(index)}`,
      },
    }));
    return vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/teams'))
        return Promise.resolve(jsonResponse({ data: [] }));
      if (url.includes('/admin/articles?'))
        return Promise.resolve(
          jsonResponse({
            data: [adminArticleListItemFixture],
            meta: { nextCursor: null },
          }),
        );
      if (
        url.endsWith('/admin/homepage/top-stories') &&
        (!init || init.method === 'GET')
      )
        return Promise.resolve(jsonResponse({ data: stories }));
      if (
        url.includes(
          `/admin/homepage/top-stories/${adminArticleListItemFixture.id}`,
        )
      ) {
        if (init?.method === 'PUT')
          return Promise.resolve(
            jsonResponse({
              data: {
                id: 'new',
                position: stories.length,
                article: adminArticleListItemFixture,
              },
            }),
          );
        if (init?.method === 'DELETE') return Promise.resolve(json(null, 204));
      }
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
  };

  it('marks an article as a Top Story via PUT', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter(0);
    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const [checkbox] = await screen.findAllByRole('checkbox', {
      name: 'Top Story',
    });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).includes(
              `/admin/homepage/top-stories/${adminArticleListItemFixture.id}`,
            ) && reqInit?.method === 'PUT',
        ),
      ).toBe(true),
    );
  });

  it('unmarks a Top Story via DELETE', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter(1);
    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const [checkbox] = await screen.findAllByRole('checkbox', {
      name: 'Top Story',
    });
    await waitFor(() => expect(checkbox).toBeChecked());
    await user.click(checkbox);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).includes(
              `/admin/homepage/top-stories/${adminArticleListItemFixture.id}`,
            ) && reqInit?.method === 'DELETE',
        ),
      ).toBe(true),
    );
  });

  it('disables the checkbox for an unselected article once the six-story cap is reached', async () => {
    // Six *other* articles occupy every Top Story slot, so the one article
    // shown in this list is unmarked and must be disabled by the cap.
    const fetchImplementation = buildRouter(6, {
      includeVisibleArticle: false,
    });
    renderApp('/admin/articles', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const [checkbox] = await screen.findAllByRole('checkbox', {
      name: 'Top Story',
    });
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(checkbox).toBeDisabled();
  });
});
