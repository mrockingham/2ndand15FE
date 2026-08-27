import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import {
  publicArticleFixture,
  publicHighlightArticleFixture,
  publicVideoArticleFixture,
} from '@/test/articleFixtures';

const renderCard = (
  article: Parameters<typeof ArticleCard>[0]['article'],
  favoriteTeamId?: string,
) =>
  render(
    <MemoryRouter>
      <ArticleCard article={article} favoriteTeamId={favoriteTeamId} />
    </MemoryRouter>,
  );

describe('ArticleCard — ARTICLE (unchanged behavior)', () => {
  it('renders the existing article layout: type chip, title link, and published date', () => {
    renderCard(publicArticleFixture);
    expect(screen.getByText('ORIGINAL')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Five observations from the first day of camp',
      }),
    ).toHaveAttribute('href', '/news/camp-observations-day-one');
    expect(screen.getByText(/^Published /)).toBeInTheDocument();
    expect(screen.queryByText('VIDEO')).not.toBeInTheDocument();
    expect(screen.queryByText('HIGHLIGHT')).not.toBeInTheDocument();
    expect(screen.queryByText('Official Team')).not.toBeInTheDocument();
  });
});

describe('ArticleCard — VIDEO', () => {
  it('shows a thumbnail, VIDEO badge, source attribution, and a canonical external link', () => {
    renderCard(publicVideoArticleFixture);
    expect(screen.getAllByText('VIDEO').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('img', {
        name: 'Packers release locker-room interview after practice',
      }),
    ).toHaveAttribute(
      'src',
      'https://static.example.com/packers-video-thumb.jpg',
    );
    const watchLink = screen.getByRole('link', {
      name: /Watch on Green Bay Packers/,
    });
    expect(watchLink).toHaveAttribute(
      'href',
      'https://www.packers.com/video/locker-room-interview',
    );
    expect(watchLink).toHaveAttribute('target', '_blank');
    expect(watchLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    );
    expect(watchLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer'),
    );
    expect(screen.getByText('Official Team')).toBeInTheDocument();
  });

  it('does not show the Official Team marker for a non-official VIDEO source', () => {
    renderCard({ ...publicVideoArticleFixture, sourceIsOfficialTeam: false });
    expect(screen.queryByText('Official Team')).not.toBeInTheDocument();
  });

  it('shows a polished fallback, not a broken image, when the thumbnail is missing', () => {
    renderCard({ ...publicVideoArticleFixture, mediaThumbnailUrl: null });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getAllByText('VIDEO').length).toBeGreaterThan(0);
  });
});

describe('ArticleCard — HIGHLIGHT', () => {
  it('shows a HIGHLIGHT badge and "Watch Highlight" action text, per the Chicago fixture', () => {
    renderCard(publicHighlightArticleFixture);
    expect(screen.getAllByText('HIGHLIGHT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CHI').length).toBeGreaterThan(0);
    const watchLink = screen.getByRole('link', { name: /Watch Highlight/ });
    expect(watchLink).toHaveAttribute(
      'href',
      'https://www.chicagobears.com/video/38-yard-touchdown',
    );
    expect(screen.getByText('Official Team')).toBeInTheDocument();
  });
});

describe('ArticleCard — safety', () => {
  it('never renders a video or iframe element for VIDEO/HIGHLIGHT content', () => {
    const { container } = renderCard(publicVideoArticleFixture);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });
});
