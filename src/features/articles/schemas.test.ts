import { articleFormSchema, slugPreview } from '@/features/articles/schemas';

const valid = {
  type: 'ORIGINAL' as const,
  title: 'A responsible headline',
  slug: '',
  summary: 'An original summary.',
  body: '## Analysis\n\nOriginal reporting.',
  sourceName: '',
  sourceUrl: '',
  sourcePublishedAt: '',
  heroImageUrl: '',
  heroImageAlt: '',
  heroImageAttribution: '',
  heroImageAttributionUrl: '',
  seoTitle: '',
  seoDescription: '',
  isFeatured: false,
  featuredPriority: '',
  featuredStartsAt: '',
  featuredEndsAt: '',
  teamIds: [],
  changeSummary: '',
};

describe('article editorial validation', () => {
  it('enforces type-specific content requirements', () => {
    expect(articleFormSchema.safeParse(valid).success).toBe(true);
    expect(
      articleFormSchema.safeParse({ ...valid, type: 'ORIGINAL', body: '' })
        .success,
    ).toBe(false);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        type: 'CURATED',
        body: '',
        sourceName: 'League source',
        sourceUrl: 'https://example.com/report',
      }).success,
    ).toBe(true);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        type: 'ANNOUNCEMENT',
        summary: '',
      }).success,
    ).toBe(true);
  });

  it('rejects unsafe content and inconsistent metadata', () => {
    expect(
      articleFormSchema.safeParse({ ...valid, body: '<script>bad()</script>' })
        .success,
    ).toBe(false);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        body: '[click](javascript:alert(1))',
      }).success,
    ).toBe(false);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        heroImageUrl: 'https://example.com/photo.jpg',
      }).success,
    ).toBe(false);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        teamIds: [
          '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
          '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
        ],
      }).success,
    ).toBe(false);
  });

  it('builds a stable slug preview', () => {
    expect(slugPreview('  Camp Notes: Déjà Vu!  ')).toBe('camp-notes-deja-vu');
  });
});
