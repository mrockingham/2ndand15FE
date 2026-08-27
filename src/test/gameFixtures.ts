import type {
  Game,
  GameHighlight,
  GameHighlightsResult,
} from '@/features/games/types';

export const awayGameTeamFixture = {
  id: '11111111-1111-4111-8111-111111111111',
  fullName: 'Buffalo Bills',
  abbreviation: 'BUF',
  logoUrl: null,
  primaryColor: '#00338D',
  secondaryColor: '#C60C30',
} as const;

export const homeGameTeamFixture = {
  id: '22222222-2222-4222-8222-222222222222',
  fullName: 'Miami Dolphins',
  abbreviation: 'MIA',
  logoUrl: null,
  primaryColor: '#008E97',
  secondaryColor: '#FC4C02',
} as const;

export const gameFixture: Game = {
  id: '33333333-3333-4333-8333-333333333333',
  league: 'NFL',
  season: 2026,
  seasonType: 'REG',
  week: 16,
  startTime: '2026-12-20T18:00:00.000Z',
  status: 'SCHEDULED',
  awayTeam: awayGameTeamFixture,
  homeTeam: homeGameTeamFixture,
  awayScore: null,
  homeScore: null,
  quarter: null,
  clock: null,
  venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens' },
  broadcastNetwork: 'CBS',
  isNeutralSite: false,
};

export const tbdGameFixture: Game = {
  ...gameFixture,
  id: '44444444-4444-4444-8444-444444444444',
  startTime: null,
  awayTeam: homeGameTeamFixture,
  homeTeam: awayGameTeamFixture,
  venue: { name: null, city: null },
  broadcastNetwork: null,
};

export const panthersGameTeamFixture = {
  id: '38c0acd1-35e3-429d-81cf-e37db8bbaf9c',
  fullName: 'Carolina Panthers',
  abbreviation: 'CAR',
  logoUrl: null,
  primaryColor: '#0085CA',
  secondaryColor: '#101820',
} as const;

export const cardinalsGameTeamFixture = {
  id: '8d07dd7a-c2d5-410d-bffc-5c013f88420d',
  fullName: 'Arizona Cardinals',
  abbreviation: 'ARI',
  logoUrl: null,
  primaryColor: '#97233F',
  secondaryColor: '#000000',
} as const;

export const hallOfFameGameFixture: Game = {
  id: '0768c441-16a6-457c-b50f-e7273d750d77',
  league: 'NFL',
  season: 2026,
  seasonType: 'PRE',
  week: null,
  startTime: '2026-08-07T00:00:00.000Z',
  status: 'FINAL',
  awayTeam: panthersGameTeamFixture,
  homeTeam: cardinalsGameTeamFixture,
  awayScore: 33,
  homeScore: 30,
  quarter: 4,
  clock: '0',
  venue: {
    name: 'Tom Benson Hall of Fame Stadium',
    city: 'Canton, Ohio',
  },
  broadcastNetwork: 'NBC',
  isNeutralSite: true,
};

export const preseasonWeekOneFixture: Game = {
  ...hallOfFameGameFixture,
  id: '99999999-9999-4999-8999-999999999998',
  week: 1,
  startTime: '2026-08-13T23:00:00.000Z',
  status: 'SCHEDULED',
  awayScore: null,
  homeScore: null,
  quarter: null,
  clock: null,
  venue: { name: 'Week One Stadium', city: 'Charlotte' },
  broadcastNetwork: 'ESPN',
  isNeutralSite: false,
};

export const gameHighlightFixture: GameHighlight = {
  id: 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Bills vs. Dolphins | Game Highlights',
  description: null,
  highlightType: 'GAME',
  thumbnailUrl: 'https://static.example.com/highlight-thumb.jpg',
  canonicalUrl: 'https://www.youtube.com/watch?v=canonical',
  embedUrl: 'https://www.youtube.com/embed/canonical',
  canEmbed: true,
  publishedAt: '2026-12-20T21:45:00.000Z',
};

export const secondGameHighlightFixture: GameHighlight = {
  ...gameHighlightFixture,
  id: 'aaaaaaaa-2222-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Bills vs. Dolphins | Postgame Reaction',
  canonicalUrl: 'https://www.youtube.com/watch?v=canonical-2',
  embedUrl: 'https://www.youtube.com/embed/canonical-2',
};

export const thirdGameHighlightFixture: GameHighlight = {
  ...gameHighlightFixture,
  id: 'aaaaaaaa-3333-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Bills vs. Dolphins | Locker Room',
  canonicalUrl: 'https://www.youtube.com/watch?v=canonical-3',
  embedUrl: 'https://www.youtube.com/embed/canonical-3',
};

export const nonEmbeddableGameHighlightFixture: GameHighlight = {
  ...gameHighlightFixture,
  id: 'aaaaaaaa-4444-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Bills vs. Dolphins | Not Embeddable',
  canEmbed: false,
};

export const embeddableWithoutEmbedUrlFixture: GameHighlight = {
  ...gameHighlightFixture,
  id: 'aaaaaaaa-5555-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Bills vs. Dolphins | Missing Embed URL',
  canEmbed: true,
  embedUrl: null,
};

export const gameHighlightsAvailableFixture: GameHighlightsResult = {
  gameId: gameFixture.id,
  coverage: 'AVAILABLE',
  highlights: [gameHighlightFixture],
};

export const gameHighlightsPendingFixture: GameHighlightsResult = {
  gameId: gameFixture.id,
  coverage: 'PENDING',
  highlights: [],
};

export const gameHighlightsUnavailableFixture: GameHighlightsResult = {
  gameId: gameFixture.id,
  coverage: 'UNAVAILABLE',
  highlights: [],
};

export const gameHighlightsUnknownFixture: GameHighlightsResult = {
  gameId: gameFixture.id,
  coverage: 'UNKNOWN',
  highlights: [],
};

export const gameHighlightsProviderErrorFixture: GameHighlightsResult = {
  gameId: gameFixture.id,
  coverage: 'PROVIDER_ERROR',
  highlights: [],
};
