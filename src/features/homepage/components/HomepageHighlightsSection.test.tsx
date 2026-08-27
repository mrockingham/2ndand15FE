import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { HomepageHighlightsSection } from '@/features/homepage/components/HomepageHighlightsSection';
import type { HomepageHighlight } from '@/features/homepage/types';
import { awayGameTeamFixture, homeGameTeamFixture } from '@/test/gameFixtures';

const buildHighlight = (index: number): HomepageHighlight => ({
  gameId: `game-${String(index)}`,
  title: `Highlight ${String(index)}`,
  thumbnailUrl: null,
  canonicalUrl: null,
  embedUrl: null,
  canEmbed: false,
  mediaType: index % 2 === 0 ? 'CURATED' : 'AUTOMATIC',
  awayTeam: { ...awayGameTeamFixture, abbreviation: `A${String(index)}` },
  homeTeam: { ...homeGameTeamFixture, abbreviation: `H${String(index)}` },
  gameDate: null,
  homepageSelection: index % 2 === 0 ? 'CURATED' : 'AUTOMATIC',
});

const renderSection = (count: number) => {
  const highlights = Array.from({ length: count }, (_value, index) =>
    buildHighlight(index),
  );
  render(
    <MemoryRouter>
      <HomepageHighlightsSection highlights={highlights} />
    </MemoryRouter>,
  );
  return highlights;
};

describe('HomepageHighlightsSection', () => {
  it('renders nothing when there are no highlights', () => {
    render(
      <MemoryRouter>
        <HomepageHighlightsSection highlights={[]} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument();
  });

  it.each([3, 5, 10])(
    'renders %i highlights in exact backend order with a scrollable, non-grid row',
    (count) => {
      const highlights = renderSection(count);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(count);
      links.forEach((link, index) => {
        expect(link).toHaveAttribute(
          'href',
          `/games/${highlights[index]!.gameId}`,
        );
      });

      const row = links[0]!.closest('div')?.parentElement;
      expect(row).not.toBeNull();
      expect(row).toHaveStyle({ overflowX: 'auto' });
      expect(row?.style.gridTemplateColumns).toBe('');
    },
  );

  it('hides Previous/Next arrow controls when few enough highlights exist', () => {
    renderSection(3);
    expect(
      screen.queryByRole('button', { name: 'Previous highlights' }),
    ).not.toBeInTheDocument();
  });

  it('shows Previous/Next arrow controls once there are more highlights than fit', () => {
    renderSection(10);
    expect(
      screen.getByRole('button', { name: 'Previous highlights' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Next highlights' }),
    ).toBeInTheDocument();
  });

  it('scrolls the row when the next arrow is clicked', async () => {
    renderSection(10);
    const container = screen.getAllByRole('link')[0]!.closest('div')
      ?.parentElement as HTMLElement;
    const scrollBy = vi.fn();
    container.scrollBy = scrollBy;

    screen.getByRole('button', { name: 'Next highlights' }).click();

    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
  });
});
