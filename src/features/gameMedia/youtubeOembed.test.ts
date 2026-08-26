import {
  checkYoutubeEmbeddable,
  extractYoutubeVideoId,
} from '@/features/gameMedia/youtubeOembed';

describe('extractYoutubeVideoId', () => {
  it('extracts the id from a watch URL', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/watch?v=r3kR5f2lToI'),
    ).toBe('r3kR5f2lToI');
  });

  it('extracts the id from a youtu.be short link', () => {
    expect(extractYoutubeVideoId('https://youtu.be/r3kR5f2lToI')).toBe(
      'r3kR5f2lToI',
    );
  });

  it('extracts the id from a shorts link', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/shorts/r3kR5f2lToI'),
    ).toBe('r3kR5f2lToI');
  });

  it('extracts the id from an already-embed URL', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/embed/r3kR5f2lToI'),
    ).toBe('r3kR5f2lToI');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYoutubeVideoId('https://vimeo.com/12345')).toBeNull();
  });

  it('returns null for an unparseable URL', () => {
    expect(extractYoutubeVideoId('not a url')).toBeNull();
  });

  it('returns null when the watch URL has no v parameter', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch')).toBeNull();
  });
});

describe('checkYoutubeEmbeddable', () => {
  it('reports embeddable and derives the embed URL/title/thumbnail on a successful oEmbed response', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Bills vs. Dolphins | Full Highlights',
          thumbnail_url: 'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
        }),
        { status: 200 },
      ),
    );
    const result = await checkYoutubeEmbeddable(
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
      fetchImplementation,
    );
    expect(result).toEqual({
      embeddable: true,
      videoId: 'r3kR5f2lToI',
      embedUrl: 'https://www.youtube.com/embed/r3kR5f2lToI',
      title: 'Bills vs. Dolphins | Full Highlights',
      thumbnailUrl: 'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('https://www.youtube.com/oembed?url='),
    );
  });

  it('reports not embeddable when oEmbed responds 401 (embedding disabled)', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 401 }));
    const result = await checkYoutubeEmbeddable(
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
      fetchImplementation,
    );
    expect(result.embeddable).toBe(false);
    expect(result.embedUrl).toBeNull();
  });

  it('reports not embeddable when oEmbed responds 404 (video missing)', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const result = await checkYoutubeEmbeddable(
      'https://www.youtube.com/watch?v=missing',
      fetchImplementation,
    );
    expect(result.embeddable).toBe(false);
  });

  it('reports not embeddable and never fetches for a non-YouTube URL', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const result = await checkYoutubeEmbeddable(
      'https://vimeo.com/12345',
      fetchImplementation,
    );
    expect(result).toEqual({
      embeddable: false,
      videoId: null,
      embedUrl: null,
      title: null,
      thumbnailUrl: null,
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('reports not embeddable when the network request fails', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('network error'));
    const result = await checkYoutubeEmbeddable(
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
      fetchImplementation,
    );
    expect(result.embeddable).toBe(false);
  });
});
