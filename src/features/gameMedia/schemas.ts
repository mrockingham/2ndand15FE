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

export const curatedVideoFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  embedUrl: requiredHttpsUrl,
  canonicalUrl: optionalHttpsUrl,
  thumbnailUrl: optionalHttpsUrl,
  sourceLabel: z.string().trim().max(80),
});

export type CuratedVideoFormValues = z.infer<typeof curatedVideoFormSchema>;
