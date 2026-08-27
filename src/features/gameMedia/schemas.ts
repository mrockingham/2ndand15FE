import { z } from 'zod';

const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

const looksLikeMarkup = (value: string) => /<[^>]+>/.test(value);

// Guards against pasting the oEmbed *check* URL (used by the "Check
// embeddability" helper to query YouTube's API) into the embed URL field --
// that's a JSON API endpoint, not a playable embed page, so a video with
// this as its src will never play even though it "looks like a URL".
const looksLikeOembedCheckUrl = (value: string) => {
  try {
    return new URL(value).pathname.toLowerCase().includes('/oembed');
  } catch {
    return false;
  }
};

const requiredHttpsUrl = z
  .string()
  .trim()
  .min(1, 'URL is required.')
  .max(2048)
  .refine((value) => !looksLikeMarkup(value), {
    message: 'Paste the embed URL, not iframe or HTML code.',
  })
  .refine(isHttpsUrl, { message: 'Use a secure (https://) URL.' });

const optionalHttpsUrl = z.union([z.literal(''), requiredHttpsUrl]);

const embedUrlField = requiredHttpsUrl.refine(
  (value) => !looksLikeOembedCheckUrl(value),
  {
    message:
      'This looks like the oEmbed check URL, not the embed URL. Paste a URL like https://www.youtube.com/embed/VIDEO_ID, or use "Check embeddability" above and click "Use this video".',
  },
);

export const curatedVideoFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  embedUrl: embedUrlField,
  canonicalUrl: optionalHttpsUrl,
  thumbnailUrl: optionalHttpsUrl,
  sourceLabel: z.string().trim().max(80),
});

export type CuratedVideoFormValues = z.infer<typeof curatedVideoFormSchema>;
