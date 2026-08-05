import {
  conversionFormSchema,
  sourceFormSchema,
} from '@/features/newsInbox/schemas';

describe('news inbox validation', () => {
  it('rejects private feeds and requires feed kinds to match their URL', () => {
    const base = {
      name: 'Source',
      slug: 'source',
      kind: 'RSS' as const,
      status: 'PAUSED' as const,
      siteUrl: 'https://example.com',
      publisherName: 'Publisher',
      defaultTeamId: '',
      isOfficialLeague: false,
      isOfficialTeam: false,
      allowsDescriptionUse: false,
      notes: '',
    };
    expect(
      sourceFormSchema.safeParse({ ...base, feedUrl: 'http://localhost/feed' })
        .success,
    ).toBe(false);
    expect(
      sourceFormSchema.safeParse({
        ...base,
        kind: 'MANUAL_ONLY',
        feedUrl: 'https://example.com/feed',
      }).success,
    ).toBe(false);
    expect(
      sourceFormSchema.safeParse({
        ...base,
        feedUrl: 'https://example.com/feed',
      }).success,
    ).toBe(true);
  });

  it('requires an editor-authored summary and paired hero metadata', () => {
    const base = {
      title: 'Draft',
      slug: '',
      originalSummary: '',
      originalCommentary: '',
      confirmedTeamIds: [],
      heroImageUrl: '',
      heroImageAlt: '',
      heroImageAttribution: '',
      heroImageAttributionUrl: '',
      changeSummary: '',
    };
    expect(conversionFormSchema.safeParse(base).success).toBe(false);
    expect(
      conversionFormSchema.safeParse({
        ...base,
        originalSummary: 'Original reporting context.',
        heroImageUrl: 'https://example.com/image.jpg',
      }).success,
    ).toBe(false);
    expect(
      conversionFormSchema.safeParse({
        ...base,
        originalSummary: 'Original reporting context.',
      }).success,
    ).toBe(true);
  });
});
