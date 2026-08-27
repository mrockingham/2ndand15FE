// A client-side convenience only: paste a normal YouTube watch/share link
// and confirm via YouTube's public oEmbed endpoint that it allows embedding,
// before the admin manually reviews and submits the embed URL. This never
// substitutes for the backend's authoritative host allowlist/embed check --
// it just saves the admin from hand-constructing an embed URL and title.

export interface YoutubeOembedCheckResult {
  readonly embeddable: boolean;
  readonly videoId: string | null;
  readonly embedUrl: string | null;
  readonly title: string | null;
  readonly thumbnailUrl: string | null;
}

const isYoutubeHost = (hostname: string) => {
  const host = hostname.toLowerCase();
  return (
    host === 'youtube.com' ||
    host === 'www.youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be'
  );
};

export const extractYoutubeVideoId = (url: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!isYoutubeHost(parsed.hostname)) return null;

  if (parsed.hostname.toLowerCase() === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '');
    return id.length > 0 ? id : null;
  }
  if (parsed.pathname === '/watch') {
    return parsed.searchParams.get('v');
  }
  const shortsMatch = /^\/shorts\/([^/]+)/.exec(parsed.pathname);
  if (shortsMatch?.[1]) return shortsMatch[1];
  const embedMatch = /^\/embed\/([^/]+)/.exec(parsed.pathname);
  if (embedMatch?.[1]) return embedMatch[1];
  return null;
};

interface YoutubeOembedResponse {
  readonly title?: string;
  readonly thumbnail_url?: string;
}

export const checkYoutubeEmbeddable = async (
  url: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<YoutubeOembedCheckResult> => {
  const videoId = extractYoutubeVideoId(url);
  const notEmbeddable: YoutubeOembedCheckResult = {
    embeddable: false,
    videoId,
    embedUrl: null,
    title: null,
    thumbnailUrl: null,
  };
  if (videoId === null) return notEmbeddable;

  try {
    const response = await fetchImplementation(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    );
    // YouTube's oEmbed endpoint responds 401 when the uploader has disabled
    // embedding and 404 when the video doesn't exist -- either way, !ok
    // means "not embeddable" here.
    if (!response.ok) return notEmbeddable;
    const data = (await response.json()) as YoutubeOembedResponse;
    return {
      embeddable: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: data.title ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return notEmbeddable;
  }
};
