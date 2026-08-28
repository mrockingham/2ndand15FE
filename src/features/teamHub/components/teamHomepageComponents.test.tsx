import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TeamEditorialSection } from '@/features/teamHub/components/TeamEditorialSection';
import { TeamHighlightsSection } from '@/features/teamHub/components/TeamHighlightsSection';
import { TeamHubHero } from '@/features/teamHub/components/TeamHubHero';
import type { TeamHomepageVideoItem } from '@/features/teamHub/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';
import { publicArticleFixture } from '@/test/articleFixtures';
import { billsFixture } from '@/test/authFixtures';

const video = (index: number): TeamHomepageVideoItem => ({
  type: 'VIDEO',
  id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  gameId: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  title: `Team video ${String(index)}`,
  thumbnailUrl: `https://static.example.com/video-${String(index)}.jpg`,
  canonicalUrl: `https://www.youtube.com/watch?v=video${String(index)}`,
  embedUrl: `https://www.youtube.com/embed/video${String(index)}`,
  canEmbed: true,
  publishedAt: '2026-08-20T12:00:00.000Z',
});

const tokens = getTeamThemeTokens(
  getTeamVisualConfig(billsFixture.abbreviation),
  'dark',
);

describe('Team Homepage public components', () => {
  it('applies a custom banner focal point and overlay, then falls back after image failure', () => {
    render(
      <MemoryRouter>
        <TeamHubHero
          preview
          team={billsFixture}
          teamTokens={tokens}
          banner={{
            imageUrl: 'https://res.cloudinary.com/example/action.jpg',
            focalX: 28,
            focalY: 67,
            overlayOpacity: 42,
          }}
        />
      </MemoryRouter>,
    );

    const hero = document.querySelector('[data-team-hub-identity="BUF"]');
    expect(hero).toHaveAttribute('data-banner-image', 'custom');
    expect(hero).toHaveAttribute('data-banner-overlay-opacity', '42');
    const image = hero!.querySelector(
      'img[src="https://res.cloudinary.com/example/action.jpg"]',
    ) as HTMLElement;
    expect(image).toHaveStyle({ objectPosition: '28% 67%' });
    fireEvent.error(image);
    expect(hero).toHaveAttribute('data-banner-image', 'fallback');
  });

  it('uses the plain team treatment when the banner image is null', () => {
    render(
      <MemoryRouter>
        <TeamHubHero
          preview
          team={billsFixture}
          teamTokens={tokens}
          banner={{
            imageUrl: null,
            focalX: 50,
            focalY: 50,
            overlayOpacity: 35,
          }}
        />
      </MemoryRouter>,
    );
    expect(
      document.querySelector('[data-team-hub-identity="BUF"]'),
    ).toHaveAttribute('data-banner-image', 'fallback');
  });

  it('renders an article lead and mixed supporting items in backend order', () => {
    const secondArticle = {
      ...publicArticleFixture,
      id: '20000000-0000-4000-8000-000000000002',
      slug: 'second-team-story',
      title: 'Second team story',
    };
    render(
      <MemoryRouter>
        <TeamEditorialSection
          teamId={billsFixture.id}
          featuredItem={{ type: 'ARTICLE', article: publicArticleFixture }}
          supportingItems={[
            video(1),
            { type: 'ARTICLE', article: secondArticle },
            video(2),
          ]}
        />
      </MemoryRouter>,
    );
    const section = screen.getByRole('region', { name: 'Team News' });
    expect(
      within(section).getByText(publicArticleFixture.title),
    ).toBeInTheDocument();
    const titles = within(section)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual([
      publicArticleFixture.title,
      'Team video 1',
      'Second team story',
      'Team video 2',
    ]);
  });

  it('renders a backend-approved video in the featured 16:9 slot and hides empty editorial', () => {
    const { rerender } = render(
      <MemoryRouter>
        <TeamEditorialSection
          teamId={billsFixture.id}
          featuredItem={video(3)}
          supportingItems={[]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByTitle('Team video 3')).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <TeamEditorialSection
          teamId={billsFixture.id}
          featuredItem={null}
          supportingItems={[]}
        />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole('region', { name: 'Team News' }),
    ).not.toBeInTheDocument();
  });

  it.each([3, 5, 10])(
    'keeps %i ordered highlights in one non-wrapping row',
    (count) => {
      const highlights = Array.from({ length: count }, (_, index) =>
        video(index + 1),
      );
      const { unmount } = render(
        <MemoryRouter>
          <TeamHighlightsSection highlights={highlights} />
        </MemoryRouter>,
      );
      const section = screen.getByRole('region', { name: /team highlights/i });
      const links = within(section).getAllByRole('link');
      expect(links).toHaveLength(count);
      expect(links.map((link) => link.getAttribute('aria-label'))).toEqual(
        highlights.map((item) => `Open Game Center video: ${item.title}`),
      );
      const row = links[0]!.parentElement?.parentElement;
      expect(row).toHaveStyle({ flexWrap: 'nowrap', overflowX: 'auto' });
      if (count > 4) {
        expect(
          within(section).getByRole('button', {
            name: 'Previous team highlights',
          }),
        ).toBeInTheDocument();
        expect(
          within(section).getByRole('button', { name: 'Next team highlights' }),
        ).toBeInTheDocument();
      }
      unmount();
    },
  );

  it('hides the highlights section when the backend returns none', () => {
    render(<TeamHighlightsSection highlights={[]} />);
    expect(
      screen.queryByRole('heading', { name: 'Team Highlights' }),
    ).not.toBeInTheDocument();
  });
});
