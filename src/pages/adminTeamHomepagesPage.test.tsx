import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminTeamHomepage } from '@/features/teamHomepage/types';
import { publicArticleFixture } from '@/test/articleFixtures';
import {
  billsFixture,
  currentUserFixture,
  eaglesFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import { renderApp } from '@/test/renderApp';
import { teamHubOverviewFixture } from '@/test/teamHubFixtures';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const articlePlacementId = '40000000-0000-4000-8000-000000000001';
const videoPlacementId = '40000000-0000-4000-8000-000000000002';
const highlightPlacementId = '40000000-0000-4000-8000-000000000003';
const mediaSourceId = '40000000-0000-4000-8000-000000000004';
const gameId = '40000000-0000-4000-8000-000000000005';

const mediaSource = {
  sourceType: 'CURATED_GAME_VIDEO' as const,
  sourceId: mediaSourceId,
  gameId,
  title: 'Bears camp video',
  thumbnailUrl: 'https://static.example.com/bears-video.jpg',
  canonicalUrl: 'https://www.youtube.com/watch?v=bears',
  embedUrl: 'https://www.youtube.com/embed/bears',
  canEmbed: true,
  publishedAt: '2026-08-20T12:00:00.000Z',
};

const adminHomepage: AdminTeamHomepage = {
  banner: { imageUrl: null, focalX: 50, focalY: 50, overlayOpacity: 35 },
  editorial: {
    placements: [
      {
        id: articlePlacementId,
        teamId: billsFixture.id,
        sourceType: 'ARTICLE',
        sourceId: publicArticleFixture.id,
        mediaSourceType: null,
        gameId: null,
        position: 0,
        isLeadReplacement: false,
        createdAt: '2026-08-20T12:00:00.000Z',
        updatedAt: '2026-08-20T12:00:00.000Z',
        source: {
          id: publicArticleFixture.id,
          title: publicArticleFixture.title,
          status: 'PUBLISHED',
          publishedAt: publicArticleFixture.publishedAt,
          updatedAt: publicArticleFixture.publishedAt,
        },
        isAvailable: true,
      },
      {
        id: videoPlacementId,
        teamId: billsFixture.id,
        sourceType: 'VIDEO',
        sourceId: mediaSourceId,
        mediaSourceType: 'CURATED_GAME_VIDEO',
        gameId,
        position: 1,
        isLeadReplacement: false,
        createdAt: '2026-08-20T12:00:00.000Z',
        updatedAt: '2026-08-20T12:00:00.000Z',
        source: mediaSource,
        isAvailable: true,
      },
    ],
  },
  highlights: {
    placements: [
      {
        id: highlightPlacementId,
        teamId: billsFixture.id,
        sourceType: 'CURATED_GAME_VIDEO',
        sourceId: mediaSourceId,
        gameId,
        position: 0,
        createdAt: '2026-08-20T12:00:00.000Z',
        updatedAt: '2026-08-20T12:00:00.000Z',
        source: mediaSource,
        isAvailable: true,
      },
    ],
    settings: { displayLimit: 5, fillWithAutomatic: true },
  },
};

const router = (homepage: AdminTeamHomepage = adminHomepage) =>
  vi.fn<typeof fetch>((input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/teams') && !url.pathname.includes('/admin/'))
      return Promise.resolve(
        jsonResponse({ data: [billsFixture, eaglesFixture] }),
      );
    if (
      /\/admin\/teams\/[^/]+\/homepage$/.test(url.pathname) &&
      init?.method === 'GET'
    )
      return Promise.resolve(jsonResponse({ data: homepage }));
    if (/\/teams\/[^/]+\/hub$/.test(url.pathname))
      return Promise.resolve(
        jsonResponse({
          data: {
            ...teamHubOverviewFixture,
            team: url.pathname.includes(eaglesFixture.id)
              ? eaglesFixture
              : billsFixture,
          },
          meta: { attribution: playerAttributionFixture },
        }),
      );
    if (url.pathname.includes('editorial-candidates'))
      return Promise.resolve(
        jsonResponse({
          data: {
            items: [
              {
                type: 'VIDEO',
                id: mediaSourceId,
                mediaSourceType: 'CURATED_GAME_VIDEO',
                ...mediaSource,
                isSelected: false,
                isLeadReplacement: false,
              },
            ],
            nextCursor: null,
          },
        }),
      );
    if (url.pathname.includes('highlight-candidates'))
      return Promise.resolve(
        jsonResponse({
          data: {
            items: [{ ...mediaSource, isSelected: false }],
            nextCursor: null,
          },
        }),
      );
    if (init?.method === 'DELETE')
      return Promise.resolve(new Response(null, { status: 204 }));
    if (url.pathname.endsWith('/banner') && init?.method === 'PUT')
      return Promise.resolve(
        jsonResponse({
          data: { ...homepage.banner, ...JSON.parse(String(init.body)) },
        }),
      );
    if (
      url.pathname.endsWith(`/editorial/${videoPlacementId}`) &&
      init?.method === 'PUT'
    )
      return Promise.resolve(
        jsonResponse({
          data: {
            ...homepage.editorial.placements[1],
            isLeadReplacement: true,
          },
        }),
      );
    if (url.pathname.endsWith('/editorial') && init?.method === 'POST')
      return Promise.resolve(
        jsonResponse({ data: homepage.editorial.placements[1] }, 201),
      );
    if (url.pathname.endsWith('/highlights') && init?.method === 'POST')
      return Promise.resolve(
        jsonResponse({ data: homepage.highlights.placements[0] }, 201),
      );
    if (url.pathname.endsWith('/settings') && init?.method === 'PUT')
      return Promise.resolve(
        jsonResponse({ data: JSON.parse(String(init.body)) }),
      );
    if (url.pathname.endsWith('/order') && init?.method === 'PUT')
      return Promise.resolve(jsonResponse({ data: { placements: [] } }));
    return Promise.reject(
      new TypeError(
        `Unexpected request: ${url.pathname} ${init?.method ?? 'GET'}`,
      ),
    );
  });

describe('Admin Team Homepages', () => {
  it('selects a team in the URL, previews real banner styling, saves exact values, and clears the image', async () => {
    const user = userEvent.setup();
    const fetchImplementation = router({
      ...adminHomepage,
      banner: {
        ...adminHomepage.banner,
        imageUrl: 'https://res.cloudinary.com/example/existing.jpg',
      },
    });
    const { router: appRouter } = renderApp('/admin/team-homepages', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByRole('heading', { name: 'Team Homepages' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        new URLSearchParams(appRouter.state.location.search).get('teamId'),
      ).toBe(billsFixture.id),
    );
    const preview = await waitFor(() => {
      const element = document.querySelector('[data-team-hub-identity="BUF"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(preview).toHaveAttribute('data-banner-image', 'custom');

    await user.click(screen.getByRole('button', { name: 'Clear image' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([input, init]) =>
            String(input).endsWith('/banner') &&
            init?.method === 'PUT' &&
            JSON.parse(String(init.body)).imageUrl === null,
        ),
      ).toBe(true),
    );

    await user.clear(screen.getByLabelText('Image URL'));
    await user.type(
      screen.getByLabelText('Image URL'),
      'https://res.cloudinary.com/example/bills.jpg',
    );
    await user.clear(screen.getByLabelText('Focal X'));
    await user.type(screen.getByLabelText('Focal X'), '30');
    await user.clear(screen.getByLabelText('Focal Y'));
    await user.type(screen.getByLabelText('Focal Y'), '65');
    await user.clear(screen.getByLabelText('Overlay opacity'));
    await user.type(screen.getByLabelText('Overlay opacity'), '45');
    expect(preview).toHaveAttribute('data-banner-image', 'custom');
    await user.click(screen.getByRole('button', { name: 'Save Banner' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([input, init]) =>
            String(input).endsWith('/banner') &&
            init?.method === 'PUT' &&
            JSON.stringify(JSON.parse(String(init.body))) ===
              JSON.stringify({
                imageUrl: 'https://res.cloudinary.com/example/bills.jpg',
                focalX: 30,
                focalY: 65,
                overlayOpacity: 45,
              }),
        ),
      ).toBe(true),
    );
    await user.click(screen.getByLabelText('Team'));
    await user.click(
      await screen.findByRole('option', { name: /PHI.*Philadelphia Eagles/ }),
    );
    await waitFor(() =>
      expect(
        new URLSearchParams(appRouter.state.location.search).get('teamId'),
      ).toBe(eaglesFixture.id),
    );
  });

  it('sends editorial lead, reorder, remove, highlight settings, and candidate payloads to the selected team only', async () => {
    const user = userEvent.setup();
    const fetchImplementation = router();
    renderApp(`/admin/team-homepages?teamId=${billsFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await screen.findAllByText('Bears camp video');
    await user.click(screen.getByLabelText('Replace main Top Story'));
    await user.click(
      screen.getByRole('button', {
        name: `Move ${publicArticleFixture.title} down`,
      }),
    );
    const editorialCard = screen
      .getByText(publicArticleFixture.title)
      .closest('.MuiCard-root');
    await user.click(
      within(editorialCard as HTMLElement).getByRole('button', {
        name: 'Remove',
      }),
    );
    await user.clear(screen.getByLabelText('Display Limit'));
    await user.type(screen.getByLabelText('Display Limit'), '8');
    await user.tab();
    await user.click(screen.getByLabelText('Fill Automatically'));
    await user.click(screen.getByRole('button', { name: 'Add content' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Add Team Top Story',
    });
    await user.click(within(dialog).getByLabelText('Replace main Top Story'));
    await user.click(within(dialog).getByRole('button', { name: 'Add' }));
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Add Team Top Story' }),
      ).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: 'Add highlight' }));
    const highlightDialog = await screen.findByRole('dialog', {
      name: 'Add Team Highlight',
    });
    await user.click(
      within(highlightDialog).getByRole('button', { name: 'Add' }),
    );
    await waitFor(() => {
      const mutationCalls = fetchImplementation.mock.calls.filter(
        ([, init]) => init?.method && init.method !== 'GET',
      );
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith(`/editorial/${videoPlacementId}`) &&
            JSON.parse(String(init?.body)).isLeadReplacement === true,
        ),
      ).toBe(true);
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith('/editorial/order') &&
            JSON.parse(String(init?.body)).placementIds[0] === videoPlacementId,
        ),
      ).toBe(true);
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith(`/editorial/${articlePlacementId}`) &&
            init?.method === 'DELETE',
        ),
      ).toBe(true);
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith('/highlights/settings') &&
            JSON.parse(String(init?.body)).displayLimit === 8,
        ),
      ).toBe(true);
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith('/highlights') &&
            JSON.parse(String(init?.body)).sourceType === 'CURATED_GAME_VIDEO',
        ),
      ).toBe(true);
      expect(
        mutationCalls.some(
          ([input, init]) =>
            String(input).endsWith('/editorial') &&
            JSON.parse(String(init?.body)).sourceType === 'VIDEO',
        ),
      ).toBe(true);
      expect(
        mutationCalls.every(([input]) =>
          String(input).includes(billsFixture.id),
        ),
      ).toBe(true);
    });
  });
});
