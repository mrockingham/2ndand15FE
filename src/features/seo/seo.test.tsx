import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { resolveRouteSeo } from '@/features/seo/routeSeo';
import { SeoManager } from '@/features/seo/SeoManager';
import {
  applySeoMetadata,
  buildPageTitle,
  getCanonicalUrl,
} from '@/features/seo/seo';

describe('SEO metadata', () => {
  it('maps public routes to indexable, descriptive metadata', () => {
    const publicMetadata = resolveRouteSeo('/power-rankings');
    expect(publicMetadata).toMatchObject({
      title: buildPageTitle('NFL Power Rankings'),
      canonicalPath: '/power-rankings',
    });
    expect(publicMetadata.noIndex).not.toBe(true);
    expect(resolveRouteSeo('/admin/games')).toMatchObject({
      noIndex: true,
      canonicalPath: '/admin/games',
    });
    expect(resolveRouteSeo('/fantasy')).toMatchObject({ noIndex: true });
  });

  it('updates title, description, canonical, social, and robots metadata', async () => {
    render(
      <MemoryRouter initialEntries={['/power-rankings?edition=preseason']}>
        <SeoManager />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(document.title).toBe(buildPageTitle('NFL Power Rankings')),
    );
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute('content', expect.stringContaining('team strengths'));
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      expect.stringContaining('index,follow'),
    );
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute('href', getCanonicalUrl('/power-rankings'));
    expect(
      document.head.querySelector('meta[property="og:title"]'),
    ).toHaveAttribute('content', buildPageTitle('NFL Power Rankings'));
  });

  it('writes article structured data without leaving stale image metadata', () => {
    applySeoMetadata({
      title: buildPageTitle('Week 1 preview'),
      description: 'A factual Week 1 preview.',
      canonicalPath: '/news/week-1-preview',
      imageUrl: 'https://images.example.com/week-1.jpg',
      type: 'article',
      publishedAt: '2026-09-01T12:00:00.000Z',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'Week 1 preview',
      },
    });

    expect(
      document.head.querySelector('meta[property="og:image"]'),
    ).toHaveAttribute('content', 'https://images.example.com/week-1.jpg');
    expect(
      document.head.querySelector('script[data-seo-structured-data="true"]')
        ?.textContent,
    ).toContain('NewsArticle');

    applySeoMetadata({
      title: buildPageTitle('NFL News'),
      description: 'NFL news.',
      canonicalPath: '/news',
    });
    expect(
      document.head.querySelector('meta[property="og:image"]'),
    ).not.toBeInTheDocument();
  });
});
