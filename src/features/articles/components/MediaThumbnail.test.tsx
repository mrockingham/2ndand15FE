import { fireEvent, render, screen } from '@testing-library/react';

import { MediaThumbnail } from '@/features/articles/components/MediaThumbnail';
import { articleTeamFixture } from '@/test/articleFixtures';

describe('MediaThumbnail', () => {
  it('renders the image and a visible content-type badge when a thumbnail exists', () => {
    render(
      <MediaThumbnail
        thumbnailUrl="https://example.com/thumb.jpg"
        alt="Bills locker-room interview"
        contentType="VIDEO"
        team={articleTeamFixture}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Bills locker-room interview' }),
    ).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    expect(screen.getByText('VIDEO')).toBeInTheDocument();
  });

  it('falls back to a team helmet, never a broken image, when the thumbnail is missing', () => {
    render(
      <MediaThumbnail
        thumbnailUrl={null}
        alt="Bills touchdown highlight"
        contentType="HIGHLIGHT"
        team={articleTeamFixture}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('HIGHLIGHT')).toBeInTheDocument();
  });

  it('falls back to a neutral icon when there is no team and no thumbnail', () => {
    render(
      <MediaThumbnail
        thumbnailUrl={null}
        alt="League-wide highlight"
        contentType="HIGHLIGHT"
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('HIGHLIGHT')).toBeInTheDocument();
  });

  it('falls back to the team helmet after the image fails to load', () => {
    render(
      <MediaThumbnail
        thumbnailUrl="https://example.com/broken.jpg"
        alt="Bills locker-room interview"
        contentType="VIDEO"
        team={articleTeamFixture}
      />,
    );
    const img = screen.getByRole('img', {
      name: 'Bills locker-room interview',
    });
    fireEvent.error(img);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
