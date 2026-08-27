import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { HomepageHeroCarousel } from '@/features/homepage/components/HomepageHeroCarousel';
import type { PublicHeroSlide } from '@/features/homepage/types';

const baseSlide: PublicHeroSlide = {
  id: 'slide-1',
  position: 0,
  imageUrl: 'https://example.com/one.jpg',
  imageAlt: 'First slide',
  imageBrightness: 100,
  imageContrast: 100,
  imageSaturation: 100,
  overlayOpacity: 0,
  focalPointX: 50,
  focalPointY: 50,
  imageScale: 100,
  contentBlocks: [
    {
      slot: 'BOTTOM_LEFT',
      content: {
        type: 'doc',
        children: [
          {
            type: 'heading',
            level: 1,
            children: [{ type: 'text', text: 'Slide one' }],
          },
        ],
      },
    },
  ],
  ctas: [
    {
      id: 'cta-1',
      position: 0,
      label: 'View Games',
      url: '/games',
      variant: 'PRIMARY',
    },
  ],
};

const secondSlide: PublicHeroSlide = {
  ...baseSlide,
  id: 'slide-2',
  position: 1,
  imageAlt: 'Second slide',
  contentBlocks: [
    {
      slot: 'BOTTOM_LEFT',
      content: {
        type: 'doc',
        children: [
          {
            type: 'heading',
            level: 1,
            children: [{ type: 'text', text: 'Slide two' }],
          },
        ],
      },
    },
  ],
};

const renderCarousel = (slides: readonly PublicHeroSlide[]) =>
  render(
    <MemoryRouter>
      <HomepageHeroCarousel slides={slides} />
    </MemoryRouter>,
  );

describe('HomepageHeroCarousel', () => {
  it('renders the single slide with its CTA and no navigation controls when there is only one', () => {
    renderCarousel([baseSlide]);
    expect(
      screen.getByRole('heading', { name: 'Slide one' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Games' })).toHaveAttribute(
      'href',
      '/games',
    );
    expect(
      screen.queryByRole('button', { name: 'Next slide' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('shows previous/next arrows and pagination dots for multiple slides, and switches slides', async () => {
    const user = userEvent.setup();
    renderCarousel([baseSlide, secondSlide]);
    expect(
      screen.getByRole('heading', { name: 'Slide one' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Choose a slide' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(
      screen.getByRole('heading', { name: 'Slide two' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(
      screen.getByRole('heading', { name: 'Slide one' }),
    ).toBeInTheDocument();
  });

  it('navigates directly via a pagination dot', async () => {
    const user = userEvent.setup();
    renderCarousel([baseSlide, secondSlide]);
    await user.click(screen.getByRole('tab', { name: 'Slide 2 of 2' }));
    expect(
      screen.getByRole('heading', { name: 'Slide two' }),
    ).toBeInTheDocument();
  });
});
