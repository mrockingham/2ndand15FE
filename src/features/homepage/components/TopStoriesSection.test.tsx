import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TopStoriesList } from '@/features/homepage/components/TopStoriesSection';
import {
  publicTopStoryFixture,
  secondPublicTopStoryFixture,
} from '@/test/homepageFixtures';

describe('TopStoriesList', () => {
  it('groups supporting stories on one divided card surface', () => {
    render(
      <MemoryRouter>
        <TopStoriesList
          stories={[publicTopStoryFixture, secondPublicTopStoryFixture]}
        />
      </MemoryRouter>,
    );

    const list = screen.getByRole('region', { name: /more top stories/i });
    expect(list.querySelector('.MuiCard-root')).not.toBeNull();
    expect(within(list).getAllByRole('separator')).toHaveLength(1);
    expect(
      within(list).getByText(publicTopStoryFixture.article.title),
    ).toBeInTheDocument();
    expect(
      within(list).getByText(secondPublicTopStoryFixture.article.title),
    ).toBeInTheDocument();
  });
});
