import type {
  AdminGameMediaDetail,
  AdminGameMediaListItem,
  CuratedVideo,
  GameMediaResult,
} from '@/features/gameMedia/types';
import {
  awayGameTeamFixture,
  gameFixture,
  homeGameTeamFixture,
} from '@/test/gameFixtures';

export const curatedVideoFixture: CuratedVideo = {
  id: 'cccccccc-1111-4ccc-8ccc-cccccccccccc',
  gameId: gameFixture.id,
  position: 0,
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
  title: 'Bills vs. Dolphins | Postgame Reaction',
  embedUrl: 'https://www.youtube.com/embed/curated-2',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-2',
};

export const thirdCuratedVideoFixture: CuratedVideo = {
  ...curatedVideoFixture,
  id: 'cccccccc-3333-4ccc-8ccc-cccccccccccc',
  position: 2,
  title: 'Bills vs. Dolphins | Locker Room',
  embedUrl: 'https://www.youtube.com/embed/curated-3',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-3',
};

export const fourthCuratedVideoFixture: CuratedVideo = {
  ...curatedVideoFixture,
  id: 'cccccccc-4444-4ccc-8ccc-cccccccccccc',
  position: 3,
  title: 'Bills vs. Dolphins | Fan Reactions',
  embedUrl: 'https://www.youtube.com/embed/curated-4',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-4',
};

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
};

export const adminGameMediaDetailAutomaticFixture: AdminGameMediaDetail = {
  game: adminGameMediaListItemFixture,
  displayMode: 'AUTOMATIC',
  curatedVideos: [],
};

export const adminGameMediaDetailEmptyFixture: AdminGameMediaDetail = {
  game: {
    ...adminGameMediaListItemFixture,
    automaticHighlightCount: 0,
    displayMode: 'NONE',
  },
  displayMode: 'NONE',
  curatedVideos: [],
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
};

export const gameMediaSingleCuratedResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'CURATED',
  curatedVideos: [curatedVideoFixture],
};

export const gameMediaAutomaticResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'AUTOMATIC',
  curatedVideos: [],
};

export const gameMediaNoneResultFixture: GameMediaResult = {
  gameId: gameFixture.id,
  displayMode: 'NONE',
  curatedVideos: [],
};
