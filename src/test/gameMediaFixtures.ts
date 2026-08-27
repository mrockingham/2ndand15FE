import type {
  AdminGameMediaDetail,
  AdminGameMediaListItem,
  CuratedVideo,
  GameDisplayVideo,
  GameMediaResult,
  GlobalVideo,
} from '@/features/gameMedia/types';
import {
  awayGameTeamFixture,
  gameFixture,
  gameHighlightFixture,
  homeGameTeamFixture,
} from '@/test/gameFixtures';

export const curatedVideoFixture: CuratedVideo = {
  id: 'cccccccc-1111-4ccc-8ccc-cccccccccccc',
  position: 0,
  isPrimary: true,
  title: 'Bills vs. Dolphins | Full Highlights',
  embedUrl: 'https://www.youtube.com/embed/curated-1',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-1',
  thumbnailUrl: 'https://static.example.com/curated-thumb-1.jpg',
  sourceLabel: 'NFL',
  createdAt: '2026-12-20T22:00:00.000Z',
  updatedAt: '2026-12-20T22:00:00.000Z',
};

export const secondCuratedVideoFixture: CuratedVideo = {
  ...curatedVideoFixture,
  id: 'cccccccc-2222-4ccc-8ccc-cccccccccccc',
  position: 1,
  isPrimary: false,
  title: 'Bills vs. Dolphins | Postgame Reaction',
  embedUrl: 'https://www.youtube.com/embed/curated-2',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-2',
};

export const thirdCuratedVideoFixture: CuratedVideo = {
  ...curatedVideoFixture,
  id: 'cccccccc-3333-4ccc-8ccc-cccccccccccc',
  position: 2,
  isPrimary: false,
  title: 'Bills vs. Dolphins | Locker Room',
  embedUrl: 'https://www.youtube.com/embed/curated-3',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-3',
};

export const fourthCuratedVideoFixture: CuratedVideo = {
  ...curatedVideoFixture,
  id: 'cccccccc-4444-4ccc-8ccc-cccccccccccc',
  position: 3,
  isPrimary: false,
  title: 'Bills vs. Dolphins | Fan Reactions',
  embedUrl: 'https://www.youtube.com/embed/curated-4',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-4',
};

export const globalVideoFixture: GlobalVideo = {
  id: 'gggggggg-1111-4ggg-8ggg-gggggggggggg',
  title: 'Weekly Preview: What to Watch',
  embedUrl: 'https://www.youtube.com/embed/global-1',
  canonicalUrl: 'https://www.youtube.com/watch?v=global-1',
  thumbnailUrl: 'https://static.example.com/global-thumb.jpg',
  sourceLabel: '2nd & 15',
  createdAt: '2026-12-01T12:00:00.000Z',
  updatedAt: '2026-12-01T12:00:00.000Z',
};

const displayVideoFromCurated = (video: CuratedVideo): GameDisplayVideo => ({
  id: video.id,
  mediaType: 'CURATED',
  title: video.title,
  embedUrl: video.embedUrl,
  canonicalUrl: video.canonicalUrl,
  thumbnailUrl: video.thumbnailUrl,
  sourceLabel: video.sourceLabel,
  canEmbed: true,
});

export const globalDisplayVideoFixture: GameDisplayVideo = {
  id: globalVideoFixture.id,
  mediaType: 'GLOBAL',
  title: globalVideoFixture.title,
  embedUrl: globalVideoFixture.embedUrl,
  canonicalUrl: globalVideoFixture.canonicalUrl,
  thumbnailUrl: globalVideoFixture.thumbnailUrl,
  sourceLabel: globalVideoFixture.sourceLabel,
  canEmbed: true,
};

export const automaticDisplayVideoFixture: GameDisplayVideo = {
  id: gameHighlightFixture.id,
  mediaType: 'AUTOMATIC',
  title: gameHighlightFixture.title,
  embedUrl: gameHighlightFixture.embedUrl,
  canonicalUrl: gameHighlightFixture.canonicalUrl,
  thumbnailUrl: gameHighlightFixture.thumbnailUrl,
  sourceLabel: null,
  canEmbed: false,
};

export const curatedDisplayVideoFixture =
  displayVideoFromCurated(curatedVideoFixture);
export const secondCuratedDisplayVideoFixture = displayVideoFromCurated(
  secondCuratedVideoFixture,
);
export const thirdCuratedDisplayVideoFixture = displayVideoFromCurated(
  thirdCuratedVideoFixture,
);
export const fourthCuratedDisplayVideoFixture = displayVideoFromCurated(
  fourthCuratedVideoFixture,
);

export const adminGameMediaListItemFixture: AdminGameMediaListItem = {
  gameId: gameFixture.id,
  season: gameFixture.season,
  seasonType: gameFixture.seasonType,
  week: gameFixture.week,
  startTime: gameFixture.startTime,
  status: gameFixture.status,
  homeTeam: homeGameTeamFixture,
  awayTeam: awayGameTeamFixture,
  homeScore: gameFixture.homeScore,
  awayScore: gameFixture.awayScore,
  curatedVideoCount: 0,
  automaticHighlightCount: 1,
  hasGlobalVideo: false,
  displayMode: 'AUTOMATIC',
};

export const adminGameMediaDetailCuratedFixture: AdminGameMediaDetail = {
  game: {
    ...adminGameMediaListItemFixture,
    curatedVideoCount: 2,
    displayMode: 'CURATED',
  },
  displayMode: 'CURATED',
  curatedVideos: [curatedVideoFixture, secondCuratedVideoFixture],
  globalVideo: null,
};

export const adminGameMediaDetailAutomaticFixture: AdminGameMediaDetail = {
  game: adminGameMediaListItemFixture,
  displayMode: 'AUTOMATIC',
  curatedVideos: [],
  globalVideo: null,
};

export const adminGameMediaDetailEmptyFixture: AdminGameMediaDetail = {
  game: {
    ...adminGameMediaListItemFixture,
    automaticHighlightCount: 0,
    displayMode: 'NONE',
  },
  displayMode: 'NONE',
  curatedVideos: [],
  globalVideo: null,
};

export const adminGameMediaDetailGlobalFixture: AdminGameMediaDetail = {
  game: {
    ...adminGameMediaListItemFixture,
    automaticHighlightCount: 0,
    hasGlobalVideo: true,
    displayMode: 'GLOBAL',
  },
  displayMode: 'GLOBAL',
  curatedVideos: [],
  globalVideo: globalVideoFixture,
};

export const gameMediaCuratedResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'CURATED',
  curatedVideos: [
    curatedVideoFixture,
    secondCuratedVideoFixture,
    thirdCuratedVideoFixture,
    fourthCuratedVideoFixture,
  ],
  highlights: [],
  globalVideo: null,
  displayVideos: [
    curatedDisplayVideoFixture,
    secondCuratedDisplayVideoFixture,
    thirdCuratedDisplayVideoFixture,
    fourthCuratedDisplayVideoFixture,
  ],
  coverage: 'UNKNOWN',
};

export const gameMediaCuratedWithGlobalResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'CURATED',
  curatedVideos: [curatedVideoFixture, secondCuratedVideoFixture],
  highlights: [],
  globalVideo: globalVideoFixture,
  // Backend order: C0, G, C1
  displayVideos: [
    curatedDisplayVideoFixture,
    globalDisplayVideoFixture,
    secondCuratedDisplayVideoFixture,
  ],
  coverage: 'UNKNOWN',
};

export const gameMediaSingleCuratedResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'CURATED',
  curatedVideos: [curatedVideoFixture],
  highlights: [],
  globalVideo: null,
  displayVideos: [curatedDisplayVideoFixture],
  coverage: 'UNKNOWN',
};

export const gameMediaAutomaticResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'AUTOMATIC',
  curatedVideos: [],
  highlights: [gameHighlightFixture],
  globalVideo: null,
  displayVideos: [automaticDisplayVideoFixture],
  coverage: 'AVAILABLE',
};

export const gameMediaAutomaticWithGlobalResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'AUTOMATIC',
  curatedVideos: [],
  highlights: [gameHighlightFixture],
  globalVideo: globalVideoFixture,
  // Backend order: A0, G
  displayVideos: [automaticDisplayVideoFixture, globalDisplayVideoFixture],
  coverage: 'AVAILABLE',
};

export const gameMediaGlobalOnlyResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'GLOBAL',
  curatedVideos: [],
  highlights: [],
  globalVideo: globalVideoFixture,
  displayVideos: [globalDisplayVideoFixture],
  coverage: 'UNKNOWN',
};

export const gameMediaFourCuratedWithGlobalResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'CURATED',
  curatedVideos: [
    curatedVideoFixture,
    secondCuratedVideoFixture,
    thirdCuratedVideoFixture,
    fourthCuratedVideoFixture,
  ],
  highlights: [],
  globalVideo: globalVideoFixture,
  // Backend order: C0, G, C1, C2, C3
  displayVideos: [
    curatedDisplayVideoFixture,
    globalDisplayVideoFixture,
    secondCuratedDisplayVideoFixture,
    thirdCuratedDisplayVideoFixture,
    fourthCuratedDisplayVideoFixture,
  ],
  coverage: 'UNKNOWN',
};

export const gameMediaNoneResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'NONE',
  curatedVideos: [],
  highlights: [],
  globalVideo: null,
  displayVideos: [],
  coverage: 'UNKNOWN',
};
