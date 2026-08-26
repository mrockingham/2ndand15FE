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

export const chicagoTeamFixture = {
  id: 'b1f7a1f6-6c3f-4c6a-9e2e-6e5f2b7b9a10',
  abbreviation: 'CHI',
  fullName: 'Chicago Bears',
} as const;

export const publicArticleFixture: PublicArticleListItem = {
  id: '6d60318a-eb1f-4614-a798-8a0445b1db8b',
  slug: 'camp-observations-day-one',
  type: 'ORIGINAL',
  title: 'Five observations from the first day of camp',
  summary: 'A measured look at the details that mattered in Buffalo.',
  contentType: 'ARTICLE',
  mediaThumbnailUrl: null,
  sourceName: null,
  sourceUrl: null,
  sourcePublishedAt: null,
  sourceIsOfficialTeam: false,
  heroImageUrl: null,
  heroImageAlt: null,
  isFeatured: true,
  publishedAt: '2026-08-01T14:00:00.000Z',
  teams: [articleTeamFixture],
};

export const publicVideoArticleFixture: PublicArticleListItem = {
  id: '2c9c9f36-6f4a-4b2f-8b0a-1a2b3c4d5e6f',
  slug: 'packers-locker-room-interview',
  type: 'CURATED',
  title: 'Packers release locker-room interview after practice',
  summary: 'Players react to a physical joint-practice session.',
  contentType: 'VIDEO',
  mediaThumbnailUrl: 'https://static.example.com/packers-video-thumb.jpg',
  sourceName: 'Green Bay Packers',
  sourceUrl: 'https://www.packers.com/video/locker-room-interview',
  sourcePublishedAt: '2026-08-24T10:00:00.000Z',
  sourceIsOfficialTeam: true,
  heroImageUrl: null,
  heroImageAlt: null,
  isFeatured: false,
  publishedAt: '2026-08-24T10:00:00.000Z',
  teams: [
    {
      id: 'a6c1a2f0-2b3c-4d5e-8f9a-0b1c2d3e4f50',
      abbreviation: 'GB',
      fullName: 'Green Bay Packers',
    },
  ],
};

export const publicHighlightArticleFixture: PublicArticleListItem = {
  id: '3d0d0a47-7050-4c3f-9c1b-2b3c4d5e6f71',
  slug: 'bears-38-yard-touchdown',
  type: 'CURATED',
  title: 'Caleb Williams connects for 38-yard touchdown',
  summary: 'A preseason highlight from the Bears offense.',
  contentType: 'HIGHLIGHT',
  mediaThumbnailUrl: null,
  sourceName: 'Chicago Bears',
  sourceUrl: 'https://www.chicagobears.com/video/38-yard-touchdown',
  sourcePublishedAt: '2026-08-24T11:28:00.000Z',
  sourceIsOfficialTeam: true,
  heroImageUrl: null,
  heroImageAlt: null,
  isFeatured: false,
  publishedAt: '2026-08-24T11:28:00.000Z',
  teams: [chicagoTeamFixture],
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
