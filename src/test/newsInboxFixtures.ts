import type {
  NewsCandidateDetail,
  NewsIngestionRun,
  NewsSource,
  NewsSourceDetail,
} from '@/features/newsInbox/types';
import { billsFixture } from '@/test/authFixtures';

export const sourceId = '11111111-1111-4111-8111-111111111111';
export const candidateId = '22222222-2222-4222-8222-222222222222';

export const ingestionRunFixture: NewsIngestionRun = {
  id: '33333333-3333-4333-8333-333333333333',
  sourceId,
  status: 'SUCCEEDED',
  startedAt: '2026-08-03T12:00:00.000Z',
  completedAt: '2026-08-03T12:00:01.000Z',
  fetchedCount: 3,
  createdCount: 2,
  updatedCount: 0,
  skippedCount: 1,
  failedCount: 0,
  responseBytes: 4096,
  hasResponseEtag: true,
  hasResponseModified: false,
  errorCode: null,
  errorSummary: null,
  initiatedBySnapshot: 'editor@example.com',
};

export const newsSourceFixture: NewsSource = {
  id: sourceId,
  name: 'Example Football Wire',
  slug: 'example-football-wire',
  kind: 'RSS',
  contentType: 'ARTICLE',
  status: 'ACTIVE',
  feedUrl: 'https://news.example.com/nfl.xml',
  siteUrl: 'https://news.example.com',
  publisherName: 'Example News',
  defaultTeam: {
    id: billsFixture.id,
    abbreviation: billsFixture.abbreviation,
    fullName: billsFixture.fullName,
  },
  isOfficialLeague: false,
  isOfficialTeam: false,
  allowsDescriptionUse: true,
  notes: 'Use for transaction coverage.',
  health: {
    lastCheckedAt: '2026-08-03T12:00:00.000Z',
    lastSuccessfulAt: '2026-08-03T12:00:01.000Z',
    lastErrorCode: null,
    lastErrorSummary: null,
    lastItemCount: 3,
    consecutiveFailureCount: 0,
    hasEtag: true,
    hasModifiedValidator: false,
    runActive: false,
  },
  createdBySnapshot: 'admin@example.com',
  updatedBySnapshot: 'admin@example.com',
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-03T12:00:01.000Z',
};

export const newsSourceDetailFixture: NewsSourceDetail = {
  source: newsSourceFixture,
  recentRuns: [ingestionRunFixture],
};

export const newsCandidateFixture: NewsCandidateDetail = {
  id: candidateId,
  source: {
    id: sourceId,
    name: newsSourceFixture.name,
    slug: newsSourceFixture.slug,
    publisherName: newsSourceFixture.publisherName,
    isOfficialTeam: false,
  },
  sourceName: 'Example News',
  canonicalUrl: 'https://news.example.com/story',
  headline: 'Bills open camp with a new approach',
  sourceAuthor: 'Reporter Name',
  contentType: 'ARTICLE',
  thumbnailUrl: null,
  sourcePublishedAt: '2026-08-03T10:00:00.000Z',
  discoveredAt: '2026-08-03T10:05:00.000Z',
  status: 'NEW',
  convertedArticleId: null,
  suggestedTeams: [
    {
      id: billsFixture.id,
      abbreviation: billsFixture.abbreviation,
      fullName: billsFixture.fullName,
      rule: 'TEAM_NAME_MATCH',
    },
  ],
  updatedAt: '2026-08-03T10:05:00.000Z',
  sourceExternalId: 'story-1',
  sourceDescription: '<strong>Publisher copy stays plain text.</strong>',
  dismissalReason: null,
  reviewedBySnapshot: null,
  reviewedAt: null,
  createdAt: '2026-08-03T10:05:00.000Z',
};

export const chicagoHighlightCandidateId =
  '44444444-4444-4444-8444-444444444444';

export const chicagoHighlightCandidateFixture: NewsCandidateDetail = {
  ...newsCandidateFixture,
  id: chicagoHighlightCandidateId,
  source: {
    id: 'chi-official-team-source',
    name: 'Chicago Bears',
    slug: 'chicago-bears',
    publisherName: 'Chicago Bears',
    isOfficialTeam: true,
  },
  sourceName: 'Chicago Bears',
  canonicalUrl: 'https://www.chicagobears.com/video/38-yard-touchdown',
  headline: 'Caleb Williams connects for 38-yard touchdown',
  sourceAuthor: null,
  contentType: 'HIGHLIGHT',
  thumbnailUrl: 'https://static.example.com/bears-highlight-thumb.jpg',
  sourcePublishedAt: '2026-08-24T11:28:00.000Z',
  discoveredAt: '2026-08-24T11:30:00.000Z',
  suggestedTeams: [
    {
      id: 'chi-team-id',
      abbreviation: 'CHI',
      fullName: 'Chicago Bears',
      rule: 'OFFICIAL_TEAM_SOURCE',
    },
  ],
  updatedAt: '2026-08-24T11:30:00.000Z',
  sourceExternalId: 'bears-highlight-1',
  sourceDescription:
    'Caleb Williams finds the end zone in the preseason opener.',
};
