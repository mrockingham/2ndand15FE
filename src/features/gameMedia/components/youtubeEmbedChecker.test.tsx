import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { YoutubeEmbedChecker } from '@/features/gameMedia/components/YoutubeEmbedChecker';

describe('YoutubeEmbedChecker', () => {
  it('shows a success state and fills in the video on "Use this video"', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Bills vs. Dolphins | Full Highlights',
          thumbnail_url: 'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
        }),
        { status: 200 },
      ),
    );
    const onUseVideo = vi.fn();
    const user = userEvent.setup();
    render(<YoutubeEmbedChecker onUseVideo={onUseVideo} />);

    await user.type(
      screen.getByLabelText('YouTube link'),
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
    );
    await user.click(
      screen.getByRole('button', { name: 'Check embeddability' }),
    );

    expect(await screen.findByText(/can be embedded/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use this video' }));
    expect(onUseVideo).toHaveBeenCalledWith({
      embedUrl: 'https://www.youtube.com/embed/r3kR5f2lToI',
      canonicalUrl: 'https://www.youtube.com/watch?v=r3kR5f2lToI',
      title: 'Bills vs. Dolphins | Full Highlights',
      thumbnailUrl: 'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
    });
    fetchSpy.mockRestore();
  });

  it('shows a warning when the video cannot be embedded', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 401 }));
    const user = userEvent.setup();
    render(<YoutubeEmbedChecker onUseVideo={vi.fn()} />);

    await user.type(
      screen.getByLabelText('YouTube link'),
      'https://www.youtube.com/watch?v=disabled',
    );
    await user.click(
      screen.getByRole('button', { name: 'Check embeddability' }),
    );

    expect(
      await screen.findByText(/cannot be embedded elsewhere/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use this video' }),
    ).not.toBeInTheDocument();
    fetchSpy.mockRestore();
  });
});
