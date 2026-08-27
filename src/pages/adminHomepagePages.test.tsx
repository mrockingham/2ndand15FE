import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { currentUserFixture, jsonResponse } from '@/test/authFixtures';
import {
  adminArticleListItemFixture,
  adminHeroListFixture,
  adminHeroSlideFixture,
  adminHighlightFixture,
  adminTopStoryFixture,
  highlightCandidateFixture,
  highlightSettingsFixture,
} from '@/test/homepageFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const emptyHighlightsResponse = () =>
  Promise.resolve(
    jsonResponse({
      data: { placements: [], settings: highlightSettingsFixture },
    }),
  );

describe('Admin Homepage — Hero carousel', () => {
  it('lists slides with status/reorder/delete controls and creates a new slide', async () => {
    const user = userEvent.setup();
    let slides = [adminHeroSlideFixture];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/admin/homepage/highlights'))
        return emptyHighlightsResponse();
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
      if (url.endsWith('/admin/homepage/highlights'))
        return emptyHighlightsResponse();
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
      if (url.endsWith('/admin/homepage/highlights'))
        return emptyHighlightsResponse();
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

describe('Admin Homepage — Highlights', () => {
  const buildHighlightsRouter = ({
    placements = [adminHighlightFixture],
    settings = highlightSettingsFixture,
  }: {
    readonly placements?: (typeof adminHighlightFixture)[];
    readonly settings?: typeof highlightSettingsFixture;
  } = {}) => {
    let currentPlacements = placements;
    let currentSettings = settings;
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/admin/homepage/hero'))
        return Promise.resolve(jsonResponse({ data: adminHeroListFixture }));
      if (url.endsWith('/admin/homepage/top-stories'))
        return Promise.resolve(jsonResponse({ data: [] }));
      if (url.endsWith('/admin/homepage/highlights/settings')) {
        const body = JSON.parse(String(init?.body)) as Partial<
          typeof highlightSettingsFixture
        >;
        currentSettings = { ...currentSettings, ...body };
        return Promise.resolve(jsonResponse({ data: currentSettings }));
      }
      if (url.endsWith('/admin/homepage/highlights/order')) {
        const { placementIds } = JSON.parse(String(init?.body)) as {
          placementIds: string[];
        };
        currentPlacements = placementIds.map((id, index) => ({
          ...currentPlacements.find((placement) => placement.id === id)!,
          position: index,
        }));
        return Promise.resolve(jsonResponse({ data: currentPlacements }));
      }
      if (
        url.includes('/admin/homepage/highlights/') &&
        init?.method === 'DELETE'
      ) {
        const id = url.split('/').pop()!;
        currentPlacements = currentPlacements.filter(
          (placement) => placement.id !== id,
        );
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (
        url.endsWith('/admin/homepage/highlights') &&
        init?.method === 'POST'
      ) {
        const body = JSON.parse(String(init.body)) as {
          sourceType: 'GAME_HIGHLIGHT' | 'CURATED_GAME_VIDEO';
          sourceId: string;
        };
        const created = {
          ...adminHighlightFixture,
          id: 'new-placement-id',
          position: currentPlacements.length,
          sourceType: body.sourceType,
          sourceId: body.sourceId,
        };
        currentPlacements = [...currentPlacements, created];
        return Promise.resolve(jsonResponse({ data: created }, 201));
      }
      if (url.endsWith('/admin/homepage/highlights'))
        return Promise.resolve(
          jsonResponse({
            data: { placements: currentPlacements, settings: currentSettings },
          }),
        );
      if (url.includes('/admin/homepage/highlight-candidates'))
        return Promise.resolve(
          jsonResponse({
            data: {
              candidates: [
                {
                  ...highlightCandidateFixture,
                  isSelected: currentPlacements.some(
                    (placement) =>
                      placement.sourceId === highlightCandidateFixture.sourceId,
                  ),
                },
              ],
              nextCursor: null,
            },
          }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    return fetchImplementation;
  };

  it('changes the display limit setting on blur', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildHighlightsRouter();
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const field = await screen.findByLabelText('Number shown');
    await user.clear(field);
    await user.type(field, '3');
    await user.tab();

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/highlights/settings') &&
            reqInit?.method === 'PUT' &&
            JSON.parse(String(reqInit.body)) &&
            (JSON.parse(String(reqInit.body)) as { displayLimit: number })
              .displayLimit === 3,
        ),
      ).toBe(true),
    );
  });

  it('toggles fillWithAutomatic', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildHighlightsRouter();
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const toggle = await screen.findByLabelText(
      'Fill empty spots automatically',
    );
    await user.click(toggle);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/highlights/settings') &&
            reqInit?.method === 'PUT' &&
            JSON.parse(String(reqInit.body)) &&
            (JSON.parse(String(reqInit.body)) as { fillWithAutomatic: boolean })
              .fillWithAutomatic === false,
        ),
      ).toBe(true),
    );
  });

  it('removes a highlight with the exact confirm copy and no media-deletion wording', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildHighlightsRouter();
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const removeButton = await screen.findByRole('button', {
      name: 'Remove highlight 1',
    });
    await user.click(removeButton);

    expect(
      await screen.findByText('Remove this highlight from the Homepage?'),
    ).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(
        'The original Game Center media will remain unchanged.',
      ),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/delete/i)).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith(
              `/admin/homepage/highlights/${adminHighlightFixture.id}`,
            ) && reqInit?.method === 'DELETE',
        ),
      ).toBe(true),
    );
  });

  it('adds a highlight from the candidate picker and reflects selected state', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildHighlightsRouter({ placements: [] });
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await user.click(
      await screen.findByRole('button', { name: 'Add Highlight' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Add Highlight' }),
    ).toBeInTheDocument();

    const addButton = await within(dialog).findByRole('button', {
      name: 'Add',
    });
    await user.click(addButton);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/highlights') &&
            reqInit?.method === 'POST' &&
            JSON.parse(String(reqInit.body)) &&
            (
              JSON.parse(String(reqInit.body)) as {
                sourceType: string;
                sourceId: string;
              }
            ).sourceId === highlightCandidateFixture.sourceId,
        ),
      ).toBe(true),
    );
    expect(await within(dialog).findByText('Added')).toBeInTheDocument();
  });

  it('disables Add Highlight once 10 placements exist', async () => {
    const tenPlacements = Array.from({ length: 10 }, (_value, index) => ({
      ...adminHighlightFixture,
      id: `placement-${String(index)}`,
      position: index,
      sourceId: `source-${String(index)}`,
    }));
    const fetchImplementation = buildHighlightsRouter({
      placements: tenPlacements,
    });
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByRole('button', { name: 'Add Highlight' }),
    ).toBeDisabled();
  });

  it('sends the exact ordered placementIds array on reorder', async () => {
    const user = userEvent.setup();
    const secondPlacement = {
      ...adminHighlightFixture,
      id: 'second-placement',
      position: 1,
      sourceId: 'second-source',
    };
    const fetchImplementation = buildHighlightsRouter({
      placements: [adminHighlightFixture, secondPlacement],
    });
    renderApp('/admin/homepage', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const moveDown = await screen.findByRole('button', {
      name: 'Move highlight 1 down',
    });
    await user.click(moveDown);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/homepage/highlights/order') &&
            reqInit?.method === 'PUT' &&
            JSON.stringify(
              (JSON.parse(String(reqInit.body)) as { placementIds: string[] })
                .placementIds,
            ) ===
              JSON.stringify(['second-placement', adminHighlightFixture.id]),
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
