import { z } from 'zod';

const isPublicHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host === '::1' ||
      host.startsWith('fc') ||
      host.startsWith('fd') ||
      host.startsWith('fe80:')
    )
      return false;
    const octets = host.split('.').map(Number);
    if (octets.length === 4 && octets.every((part) => Number.isInteger(part))) {
      const [first = -1, second = -1] = octets;
      if (
        first === 10 ||
        first === 127 ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168)
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
};

const requiredHttpUrl = z
  .string()
  .trim()
  .min(1, 'URL is required.')
  .max(2048)
  .refine(
    isPublicHttpUrl,
    'Use a public HTTP or HTTPS URL without credentials.',
  );
const optionalHttpUrl = z.union([z.literal(''), requiredHttpUrl]);
const optionalTimestamp = z.union([
  z.literal(''),
  z.iso.datetime({ offset: true }),
]);
const optionalText = (maximum: number) => z.string().trim().max(maximum);

export const sourceFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(160),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Use lowercase letters, numbers, and single hyphens.',
      )
      .max(96),
    kind: z.enum(['RSS', 'ATOM', 'MANUAL_ONLY']),
    status: z.enum(['ACTIVE', 'PAUSED', 'DISABLED']),
    feedUrl: optionalHttpUrl,
    siteUrl: requiredHttpUrl,
    publisherName: z.string().trim().min(1, 'Publisher is required.').max(160),
    defaultTeamId: z.union([z.literal(''), z.uuid()]),
    isOfficialLeague: z.boolean(),
    isOfficialTeam: z.boolean(),
    allowsDescriptionUse: z.boolean(),
    notes: optionalText(1000),
  })
  .superRefine((value, context) => {
    if (value.kind === 'MANUAL_ONLY' && value.feedUrl !== '') {
      context.addIssue({
        code: 'custom',
        path: ['feedUrl'],
        message: 'Manual-only sources cannot have a feed URL.',
      });
    }
    if (value.kind !== 'MANUAL_ONLY' && value.feedUrl === '') {
      context.addIssue({
        code: 'custom',
        path: ['feedUrl'],
        message: 'RSS and Atom sources require a feed URL.',
      });
    }
  });

export type SourceFormValues = z.infer<typeof sourceFormSchema>;

export const manualCandidateFormSchema = z.object({
  url: requiredHttpUrl,
  headline: z.string().trim().min(1, 'Headline is required.').max(300),
  sourceName: z.string().trim().min(1, 'Source name is required.').max(160),
  sourceId: z.union([z.literal(''), z.uuid()]),
  sourceDescription: optionalText(2000),
  sourceAuthor: optionalText(160),
  sourcePublishedAt: optionalTimestamp,
  suggestedTeamIds: z.array(z.uuid()).max(32),
});

export type ManualCandidateFormValues = z.infer<
  typeof manualCandidateFormSchema
>;

export const conversionFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(180),
    slug: z.string().trim().max(160),
    originalSummary: z
      .string()
      .trim()
      .min(1, 'Write an original summary.')
      .max(1000),
    originalCommentary: optionalText(2000),
    confirmedTeamIds: z.array(z.uuid()).max(32),
    heroImageUrl: optionalHttpUrl,
    heroImageAlt: optionalText(300),
    heroImageAttribution: optionalText(500),
    heroImageAttributionUrl: optionalHttpUrl,
    changeSummary: optionalText(500),
  })
  .superRefine((value, context) => {
    if ((value.heroImageUrl === '') !== (value.heroImageAlt === '')) {
      context.addIssue({
        code: 'custom',
        path: ['heroImageAlt'],
        message: 'Hero image URL and alt text must be supplied together.',
      });
    }
  });

export type ConversionFormValues = z.infer<typeof conversionFormSchema>;
