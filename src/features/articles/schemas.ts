import { z } from 'zod';

const optionalText = (maximum: number) => z.string().max(maximum);
const optionalHttpUrl = z.string().refine((value) => {
  if (value === '') return true;
  try {
    return (
      ['http:', 'https:'].includes(new URL(value).protocol) &&
      value.length <= 2_048
    );
  } catch {
    return false;
  }
}, 'Enter an HTTP or HTTPS URL no longer than 2,048 characters.');
const optionalOffsetTimestamp = z
  .string()
  .refine(
    (value) =>
      value === '' || z.iso.datetime({ offset: true }).safeParse(value).success,
    'Enter an ISO timestamp with an explicit UTC offset.',
  );
const safeMarkdown = z
  .string()
  .max(100_000)
  .refine(
    (value) => !/<\/?[A-Za-z!][^>]*>/.test(value),
    'Embedded HTML is not allowed; use Markdown only.',
  )
  .refine(
    (value) => !/\]\(\s*(?:javascript|data):/i.test(value),
    'Markdown links cannot use executable or embedded-data URLs.',
  );

export const articleFormSchema = z
  .object({
    type: z.enum(['ORIGINAL', 'CURATED', 'ANNOUNCEMENT']),
    title: z.string().trim().min(1).max(180),
    slug: optionalText(160),
    summary: optionalText(1_000),
    body: safeMarkdown,
    sourceName: optionalText(160),
    sourceUrl: optionalHttpUrl,
    sourcePublishedAt: optionalOffsetTimestamp,
    heroImageUrl: optionalHttpUrl,
    heroImageAlt: optionalText(300),
    heroImageAttribution: optionalText(500),
    heroImageAttributionUrl: optionalHttpUrl,
    seoTitle: optionalText(180),
    seoDescription: optionalText(320),
    isFeatured: z.boolean(),
    featuredPriority: z
      .string()
      .regex(
        /^$|^(?:[1-9]\d{0,2}|1000)$/,
        'Priority must be an integer from 1 to 1,000.',
      ),
    featuredStartsAt: optionalOffsetTimestamp,
    featuredEndsAt: optionalOffsetTimestamp,
    teamIds: z.array(z.string().uuid()).max(32),
    changeSummary: optionalText(500),
  })
  .superRefine((value, context) => {
    const required = (
      field: 'summary' | 'body' | 'sourceName' | 'sourceUrl',
      message: string,
    ) => {
      if (!value[field].trim())
        context.addIssue({ code: 'custom', path: [field], message });
    };
    if (value.type === 'ORIGINAL') {
      required('summary', 'Original articles require a summary.');
      required('body', 'Original articles require a Markdown body.');
    }
    if (value.type === 'ANNOUNCEMENT')
      required('body', 'Announcements require a Markdown body.');
    if (value.type === 'CURATED') {
      required(
        'summary',
        'Curated articles require original summary or commentary.',
      );
      required('sourceName', 'Curated articles require a source name.');
      required('sourceUrl', 'Curated articles require a source URL.');
      if (value.body.length > 2_000)
        context.addIssue({
          code: 'custom',
          path: ['body'],
          message: 'Curated commentary is limited to 2,000 characters.',
        });
    }
    if ((value.heroImageUrl === '') !== (value.heroImageAlt === ''))
      context.addIssue({
        code: 'custom',
        path: ['heroImageAlt'],
        message:
          'Hero image URL and meaningful alt text must be supplied together.',
      });
    if (
      !value.isFeatured &&
      [
        value.featuredPriority,
        value.featuredStartsAt,
        value.featuredEndsAt,
      ].some(Boolean)
    )
      context.addIssue({
        code: 'custom',
        path: ['isFeatured'],
        message: 'Featured priority and windows require featured placement.',
      });
    if (
      value.featuredStartsAt &&
      value.featuredEndsAt &&
      new Date(value.featuredEndsAt) <= new Date(value.featuredStartsAt)
    )
      context.addIssue({
        code: 'custom',
        path: ['featuredEndsAt'],
        message: 'Featured end must be after featured start.',
      });
    if (new Set(value.teamIds).size !== value.teamIds.length)
      context.addIssue({
        code: 'custom',
        path: ['teamIds'],
        message: 'Duplicate team tags are not allowed.',
      });
  });

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export const slugPreview = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 160);
