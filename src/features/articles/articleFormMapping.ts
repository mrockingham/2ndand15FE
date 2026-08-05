import type { ArticleFormValues } from '@/features/articles/schemas';
import type { ArticleEditorialFields } from '@/features/articles/types';

const empty = (value: string) => (value.trim() ? value.trim() : null);

export const toEditorialFields = (
  values: ArticleFormValues,
): ArticleEditorialFields => ({
  type: values.type,
  title: values.title.trim(),
  ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
  summary: empty(values.summary),
  body: empty(values.body),
  sourceName: empty(values.sourceName),
  sourceUrl: empty(values.sourceUrl),
  sourcePublishedAt: empty(values.sourcePublishedAt),
  heroImageUrl: empty(values.heroImageUrl),
  heroImageAlt: empty(values.heroImageAlt),
  heroImageAttribution: empty(values.heroImageAttribution),
  heroImageAttributionUrl: empty(values.heroImageAttributionUrl),
  seoTitle: empty(values.seoTitle),
  seoDescription: empty(values.seoDescription),
  isFeatured: values.isFeatured,
  featuredPriority: values.featuredPriority
    ? Number(values.featuredPriority)
    : null,
  featuredStartsAt: empty(values.featuredStartsAt),
  featuredEndsAt: empty(values.featuredEndsAt),
});
