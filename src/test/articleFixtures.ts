import type {
  AdminArticleDetail,
  ArticleRevision,
  PublicArticleDetail,
  PublicArticleListItem,
} from '@/features/articles/types';

export const articleTeamFixture = {
  id: '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
  abbreviation: 'BUF',
  fullName: 'Buffalo Bills',
} as const;

export const publicArticleFixture: PublicArticleListItem = {
  id: '6d60318a-eb1f-4614-a798-8a0445b1db8b',
  slug: 'camp-observations-day-one',
  type: 'ORIGINAL',
  title: 'Five observations from the first day of camp',
  summary: 'A measured look at the details that mattered in Buffalo.',
  sourceName: null,
  sourceUrl: null,
  sourcePublishedAt: null,
  heroImageUrl: null,
  heroImageAlt: null,
  isFeatured: true,
  publishedAt: '2026-08-01T14:00:00.000Z',
  teams: [articleTeamFixture],
};

export const publicArticleDetailFixture: PublicArticleDetail = {
  ...publicArticleFixture,
  body: '## What stood out\n\nThe offense worked through a deliberate red-zone period.',
  seoTitle: 'Buffalo training camp observations',
  seoDescription: 'Five responsible observations from day one.',
  heroImageAttribution: null,
  heroImageAttributionUrl: null,
};

export const adminArticleFixture: AdminArticleDetail = {
  ...publicArticleDetailFixture,
  status: 'DRAFT',
  version: 4,
  featuredPriority: 2,
  scheduledFor: null,
  featuredStartsAt: null,
  featuredEndsAt: null,
  publishedAt: null,
  createdAt: '2026-07-31T14:00:00.000Z',
  updatedAt: '2026-08-01T13:45:00.000Z',
};

export const articleRevisionFixture: ArticleRevision = {
  id: 'c14c7273-3782-4c35-bbb8-59b43fb8fa52',
  articleId: adminArticleFixture.id,
  revisionNumber: 4,
  editorSnapshot: 'editor@example.com',
  snapshot: {
    title: adminArticleFixture.title,
    status: adminArticleFixture.status,
    body: adminArticleFixture.body,
  },
  changeSummary: 'Tightened the opening analysis.',
  createdAt: adminArticleFixture.updatedAt,
};
