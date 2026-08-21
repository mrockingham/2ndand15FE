import type {
  FavoriteTeamPrediction,
  PublicModelPerformance,
  PublicPrediction,
  WeeklyInsightCard,
  WeeklyInsights,
} from '@/features/aiHub/types';
import { billsFixture, eaglesFixture } from '@/test/authFixtures';
import { homeGameTeamFixture } from '@/test/gameFixtures';

const team = (value: {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
}) => ({
  id: value.id,
  abbreviation: value.abbreviation,
  fullName: value.fullName,
});

const bills = team(billsFixture);
const eagles = team(eaglesFixture);
const dolphins = team(homeGameTeamFixture);

export const strongestInsightFixture: WeeklyInsightCard = {
  rank: 1,
  game: {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    startTime: '2026-08-14T00:00:00.000Z',
    awayTeam: bills,
    homeTeam: eagles,
  },
  favorite: bills,
  underdog: eagles,
  favoriteProbability: 0.785,
  underdogProbability: 0.215,
  probabilityGap: 0.57,
  projectedScore: { away: 26, home: 21 },
  projectedMargin: 5,
  projectedTotal: 47,
  confidence: 'LOW',
  factors: [],
};

export const closestInsightFixture: WeeklyInsightCard = {
  ...strongestInsightFixture,
  rank: 8,
  game: {
    ...strongestInsightFixture.game,
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    awayTeam: dolphins,
  },
  favorite: eagles,
  underdog: dolphins,
  favoriteProbability: 0.513,
  underdogProbability: 0.487,
  probabilityGap: 0.026,
  projectedScore: { away: 20, home: 21 },
  projectedMargin: 1,
  projectedTotal: 41,
};

export const favoritePredictionFixture: FavoriteTeamPrediction = {
  team: bills,
  opponent: eagles,
  game: strongestInsightFixture.game,
  teamWinProbability: 0.785,
  isPredictedWinner: true,
  projectedScore: strongestInsightFixture.projectedScore,
  confidence: 'LOW',
  factors: [],
  weeklyRank: 1,
};

export const weeklyInsightsFixture: WeeklyInsights = {
  context: {
    season: 2026,
    seasonType: 'PRE',
    week: 1,
    modelVersion: 'baseline-v1',
    predictionCount: 16,
  },
  strongestPick: strongestInsightFixture,
  strongestPicks: Array.from({ length: 5 }, (_, index) => ({
    ...strongestInsightFixture,
    rank: index + 1,
    game: {
      ...strongestInsightFixture.game,
      id: `10000000-0000-4000-8000-00000000000${String(index + 1)}`,
    },
    favoriteProbability: 0.785 - index * 0.03,
    underdogProbability: 0.215 + index * 0.03,
  })),
  closestMatchup: closestInsightFixture,
  closestMatchups: [closestInsightFixture],
  upsetWatch: {
    ...closestInsightFixture,
    opportunityTeam: dolphins,
    basis: 'MODEL_UNCERTAINTY',
  },
  mostLikelyBlowout: {
    ...strongestInsightFixture,
    blowoutScore: 0.81,
  },
  blowoutWatch: [{ ...strongestInsightFixture, blowoutScore: 0.81 }],
  projectedHighestScoringGame: {
    ...strongestInsightFixture,
    projectedScore: { away: 29, home: 28 },
    projectedMargin: 1,
    projectedTotal: 57,
  },
  projectedHighestScoringGames: [
    {
      ...strongestInsightFixture,
      projectedScore: { away: 29, home: 28 },
      projectedMargin: 1,
      projectedTotal: 57,
    },
  ],
  projectedLowestScoringGame: {
    ...closestInsightFixture,
    projectedScore: { away: 18, home: 20 },
    projectedMargin: 2,
    projectedTotal: 38,
  },
  projectedLowestScoringGames: [
    {
      ...closestInsightFixture,
      projectedScore: { away: 18, home: 20 },
      projectedMargin: 2,
      projectedTotal: 38,
    },
  ],
  offensiveEdge: {
    gameId: strongestInsightFixture.game.id,
    team: bills,
    opponent: eagles,
    edgeScore: 0.72,
    supportingFactors: ['PASSING_PRODUCTION', 'SCORING_PRODUCTION'],
    dataCoverage: {
      historicalScores: true,
      historicalPlayerStats: true,
      currentSeasonResults: false,
    },
  },
  defensiveEdge: {
    gameId: closestInsightFixture.game.id,
    team: eagles,
    opponent: dolphins,
    edgeScore: 0.64,
    supportingFactors: ['SACK_DISRUPTION'],
    dataCoverage: {
      historicalScores: true,
      historicalPlayerStats: true,
      currentSeasonResults: false,
    },
  },
  turnoverProfileEdge: {
    gameId: closestInsightFixture.game.id,
    team: dolphins,
    opponent: eagles,
    edgeScore: 0.58,
    supportingFactors: ['BALL_SECURITY'],
    dataCoverage: {
      historicalScores: true,
      historicalPlayerStats: true,
      currentSeasonResults: false,
    },
  },
  confidenceRanking: Array.from({ length: 5 }, (_, index) => ({
    ...strongestInsightFixture,
    rank: index + 1,
    game: {
      ...strongestInsightFixture.game,
      id: `20000000-0000-4000-8000-00000000000${String(index + 1)}`,
    },
    favoriteProbability: 0.785 - index * 0.03,
    underdogProbability: 0.215 + index * 0.03,
  })),
  favoriteTeamPrediction: favoritePredictionFixture,
  modelPerformance: {
    label: '2nd & 15 Model Performance',
    modelVersion: 'baseline-v1',
    season: 2026,
    seasonType: 'PRE',
    seasonRecord: {
      gamesEvaluated: 0,
      correct: 0,
      incorrect: 0,
      tiesOrExcluded: 0,
      accuracy: null,
      brierScore: null,
    },
    previousWeek: null,
  },
};

const publicPrediction = (index: number): PublicPrediction => ({
  id: `30000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  game: {
    id: `40000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    season: 2026,
    seasonType: 'PRE',
    week: 1,
    startTime: `2026-08-${String(13 + Math.floor(index / 4)).padStart(2, '0')}T${String(18 + (index % 4)).padStart(2, '0')}:00:00.000Z`,
    isNeutralSite: false,
    awayTeam: index % 2 === 0 ? bills : dolphins,
    homeTeam: eagles,
  },
  modelVersion: 'baseline-v1',
  revision: 1,
  status: 'PUBLISHED',
  homeWinProbability: 0.45,
  awayWinProbability: 0.55,
  projectedHomeScore: 20,
  projectedAwayScore: 23,
  predictedWinner: index % 2 === 0 ? bills : dolphins,
  confidence: 'LOW',
  factors: [
    {
      code: 'TEAM_STRENGTH',
      favors: 'AWAY',
      label: 'Historical team strength favors the away team.',
    },
  ],
  explanation: null,
  dataCoverage: {
    historicalScores: true,
    historicalPlayerStats: true,
    currentSeasonResults: false,
    unavailable: [
      'INJURIES',
      'ROSTER_AVAILABILITY',
      'WEATHER',
      'BETTING_MARKETS',
    ],
  },
  generatedAt: '2026-08-10T12:00:00.000Z',
  publishedAt: '2026-08-10T13:00:00.000Z',
  lockedAt: null,
  evaluation: null,
});

export const predictionFixtures = Array.from({ length: 16 }, (_, index) =>
  publicPrediction(index),
);

export const modelPerformanceFixture: PublicModelPerformance = {
  modelVersion: 'baseline-v1',
  evaluated: 0,
  decided: 0,
  tiesExcludedFromAccuracy: 0,
  correct: 0,
  incorrect: 0,
  accuracy: null,
  meanBrierScore: null,
};
