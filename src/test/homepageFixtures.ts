import { awayGameTeamFixture, homeGameTeamFixture } from '@/test/gameFixtures';
import type {
  AdminHeroList,
  AdminHeroSlide,
  AdminHomepageHighlight,
  AdminTopStory,
  HomepageAiHubSnapshot,
  HomepageHighlight,
  HomepageHighlightCandidate,
  HomepageHighlightSettings,
  HomepageInsights,
  HomepageLeader,
  HomepageLeaders,
  HomepageWeeklyLeaders,
  PublicHeroSlide,
  PublicHomepage,
  PublicTopStory,
} from '@/features/homepage/types';
import type {
  AdminArticleListItem,
  PublicArticleListItem,
} from '@/features/articles/types';

export const heroSlideFixture: PublicHeroSlide = {
  id: '11111111-1111-4111-8111-111111111111',
  position: 0,
  imageUrl: 'https://static.example.com/hero-one.jpg',
  imageAlt: 'Players celebrating a touchdown',
  imageBrightness: 100,
  imageContrast: 100,
  imageSaturation: 100,
  overlayOpacity: 20,
  focalPointX: 50,
  focalPointY: 50,
  imageScale: 100,
  contentBlocks: [
    {
      slot: 'BOTTOM_LEFT',
      content: {
        type: 'doc',
        children: [
          {
            type: 'heading',
            level: 1,
            children: [{ type: 'text', text: 'Football. Smarter. Faster.' }],
          },
        ],
      },
    },
  ],
  ctas: [
    {
      id: 'cta-1',
      position: 0,
      label: 'View Games',
      url: '/games',
      variant: 'PRIMARY',
    },
  ],
};

export const adminHeroSlideFixture: AdminHeroSlide = {
  ...heroSlideFixture,
  isActive: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

export const adminHeroListFixture: AdminHeroList = {
  slides: [adminHeroSlideFixture],
  meta: { activeCount: 1, totalCount: 1, readyForPublish: false },
};

export const topStoryArticleFixture: PublicArticleListItem = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'eagles-preview',
  type: 'ORIGINAL',
  title: 'Five observations from the first day of camp',
  summary: 'A quick look at the storylines to watch.',
  contentType: 'ARTICLE',
  mediaThumbnailUrl: null,
  sourceName: null,
  sourceUrl: null,
  sourcePublishedAt: null,
  sourceIsOfficialTeam: false,
  heroImageUrl: 'https://static.example.com/camp.jpg',
  heroImageAlt: 'Players at training camp',
  isFeatured: false,
  publishedAt: '2026-08-20T12:00:00.000Z',
  teams: [],
};

export const secondTopStoryArticleFixture: PublicArticleListItem = {
  ...topStoryArticleFixture,
  id: '33333333-3333-4333-8333-333333333333',
  slug: 'week-two-power-rankings',
  title: 'Week two power rankings',
};

export const publicTopStoryFixture: PublicTopStory = {
  id: 'top-story-1',
  position: 0,
  article: topStoryArticleFixture,
};

export const secondPublicTopStoryFixture: PublicTopStory = {
  id: 'top-story-2',
  position: 1,
  article: secondTopStoryArticleFixture,
};

export const adminArticleListItemFixture: AdminArticleListItem = {
  id: topStoryArticleFixture.id,
  slug: topStoryArticleFixture.slug,
  type: 'ORIGINAL',
  status: 'PUBLISHED',
  version: 1,
  title: topStoryArticleFixture.title,
  summary: topStoryArticleFixture.summary,
  contentType: 'ARTICLE',
  mediaThumbnailUrl: null,
  isFeatured: false,
  featuredPriority: null,
  publishedAt: topStoryArticleFixture.publishedAt,
  scheduledFor: null,
  teams: [],
  createdAt: '2026-08-19T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
};

export const adminTopStoryFixture: AdminTopStory = {
  id: 'top-story-1',
  position: 0,
  article: adminArticleListItemFixture,
};

export const highlightFixture: HomepageHighlight = {
  gameId: '44444444-4444-4444-8444-444444444444',
  title: 'Buffalo Bills vs. Miami Dolphins | Game Highlights',
  thumbnailUrl: 'https://static.example.com/highlight.jpg',
  canonicalUrl: 'https://www.youtube.com/watch?v=abc',
  embedUrl: 'https://www.youtube.com/embed/abc',
  canEmbed: true,
  mediaType: 'AUTOMATIC',
  awayTeam: awayGameTeamFixture,
  homeTeam: homeGameTeamFixture,
  gameDate: '2026-08-20T23:00:00.000Z',
  homepageSelection: 'AUTOMATIC',
};

export const passingLeaderFixture: HomepageLeader = {
  rank: 1,
  player: {
    id: '55555555-5555-4555-8555-555555555555',
    displayName: 'Matthew Stafford',
    position: 'QB',
    positionGroup: 'QB',
    headshotUrl: 'https://static.example.com/stafford.jpg',
  },
  team: {
    id: '66666666-6666-4666-8666-666666666666',
    abbreviation: 'LAR',
    fullName: 'Los Angeles Rams',
  },
  value: 4707,
};

export const noTeamLeaderFixture: HomepageLeader = {
  rank: 2,
  player: {
    id: '77777777-7777-4777-8777-777777777777',
    displayName: 'Multi Team Player',
    position: 'QB',
    positionGroup: 'QB',
    headshotUrl: null,
  },
  team: null,
  value: 3000,
};

export const leadersFixture: HomepageLeaders = {
  season: 2025,
  seasonType: 'REG',
  passing: [passingLeaderFixture, noTeamLeaderFixture],
  rushing: [],
  receiving: [],
};

export const insightPickFixture = {
  game: {
    gameId: '88888888-8888-4888-8888-888888888888',
    startTime: '2026-09-14T17:00:00.000Z',
    homeTeam: {
      id: '66666666-6666-4666-8666-666666666666',
      fullName: 'Los Angeles Rams',
      abbreviation: 'LAR',
    },
    awayTeam: {
      id: '99999999-9999-4999-8999-999999999999',
      fullName: 'Seattle Seahawks',
      abbreviation: 'SEA',
    },
  },
  favoriteTeam: {
    id: '66666666-6666-4666-8666-666666666666',
    fullName: 'Los Angeles Rams',
    abbreviation: 'LAR',
  },
  favoriteProbability: 0.68,
  projectedScore: { home: 27, away: 20 },
  projectedTotal: 47,
};

export const aiHubSnapshotFixture: HomepageAiHubSnapshot = {
  season: 2026,
  week: 3,
  seasonType: 'REG',
  strongestPick: insightPickFixture,
  closestMatchup: insightPickFixture,
  highestProjectedTotal: insightPickFixture,
};

export const weeklyLeadersFixture: HomepageWeeklyLeaders = {
  season: 2026,
  week: 3,
  seasonType: 'REG',
  passing: {
    playerId: '55555555-5555-4555-8555-555555555555',
    playerName: 'Matthew Stafford',
    team: 'LAR',
    value: 312,
    metric: 'passing_yards',
    week: 3,
    season: 2026,
  },
  rushing: {
    playerId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    playerName: 'Kyren Williams',
    team: 'LAR',
    value: 128,
    metric: 'rushing_yards',
    week: 3,
    season: 2026,
  },
  receiving: {
    playerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    playerName: 'Puka Nacua',
    team: 'LAR',
    value: 142,
    metric: 'receiving_yards',
    week: 3,
    season: 2026,
  },
};

export const homepageInsightsFixture: HomepageInsights = {
  aiHub: aiHubSnapshotFixture,
  weeklyLeaders: weeklyLeadersFixture,
};

export const emptyHomepageInsightsFixture: HomepageInsights = {
  aiHub: null,
  weeklyLeaders: null,
};

export const publicHomepageFixture: PublicHomepage = {
  heroSlides: [],
  topStories: [],
  highlights: [highlightFixture],
  leaders: leadersFixture,
  insights: homepageInsightsFixture,
};

export const highlightCandidateFixture: HomepageHighlightCandidate = {
  sourceType: 'GAME_HIGHLIGHT',
  sourceId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  gameId: highlightFixture.gameId,
  matchup: { awayTeam: awayGameTeamFixture, homeTeam: homeGameTeamFixture },
  title: highlightFixture.title,
  thumbnailUrl: highlightFixture.thumbnailUrl,
  gameDate: highlightFixture.gameDate,
  isSelected: false,
};

export const adminHighlightFixture: AdminHomepageHighlight = {
  id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  position: 0,
  sourceType: 'GAME_HIGHLIGHT',
  sourceId: highlightCandidateFixture.sourceId,
  gameId: highlightFixture.gameId,
  matchup: { awayTeam: awayGameTeamFixture, homeTeam: homeGameTeamFixture },
  gameDate: highlightFixture.gameDate,
  preview: {
    title: highlightFixture.title,
    thumbnailUrl: highlightFixture.thumbnailUrl,
  },
  createdAt: '2026-08-20T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

export const highlightSettingsFixture: HomepageHighlightSettings = {
  displayLimit: 5,
  fillWithAutomatic: true,
};
