import type {
  RecentPerformanceResult,
  SeasonLeader,
  StatsMetadata,
  StatsMetric,
  WeeklyLeader,
} from '@/features/statsHub/types';
import { billsFixture, eaglesFixture } from '@/test/authFixtures';
import {
  playerAttributionFixture,
  quarterbackFixture,
} from '@/test/playerFixtures';

export const statsMetricFixtures: readonly StatsMetric[] = [
  {
    id: 'passing_yards',
    label: 'Passing Yards',
    shortLabel: 'Pass Yds',
    description: 'Total passing yards recorded.',
    category: 'PASSING',
    valueType: 'INTEGER',
    sortDirection: 'DESC',
    higherIsBetter: true,
    availableForSeasonLeaders: true,
    availableForWeekLeaders: true,
    availableForRecentPerformance: true,
    nullableBehavior: 'EXCLUDE',
    decimalPlaces: 0,
    qualification: null,
  },
  {
    id: 'sacks',
    label: 'Sacks',
    shortLabel: 'Sack',
    description: 'Total defensive sacks recorded, including half-sacks.',
    category: 'DEFENSE',
    valueType: 'DECIMAL',
    sortDirection: 'DESC',
    higherIsBetter: true,
    availableForSeasonLeaders: true,
    availableForWeekLeaders: true,
    availableForRecentPerformance: true,
    nullableBehavior: 'EXCLUDE',
    decimalPlaces: 1,
    qualification: null,
  },
] as const;

export const statsMetadataFixture: StatsMetadata = {
  apiVersion: '1.0',
  availableSeasons: [2024, 2025],
  seasonTypes: {
    seasonLeaders: ['REG', 'POST', 'REG_POST'],
    weeklyLeaders: ['REG', 'POST'],
    recentPerformance: ['REG', 'POST'],
  },
  categories: [
    { id: 'PASSING', label: 'Passing' },
    { id: 'DEFENSE', label: 'Defense' },
  ],
  metrics: statsMetricFixtures,
  positions: ['QB', 'DE'],
  positionGroups: ['QB', 'DL'],
  limits: {
    leaderboards: { default: 25, maximum: 100 },
    recentGames: { default: 5, maximum: 20 },
  },
  ranking: {
    method: 'COMPETITION',
    tieExample: [1, 2, 2, 4],
    tieOrder: ['games_desc', 'display_name_asc', 'player_id_asc'],
  },
  coverageNotes: [
    'Historical player statistics cover imported records only.',
    'No live 2026 player statistics, projections, or predictions are included.',
  ],
};

const team = (source: typeof billsFixture) => ({
  id: source.id,
  abbreviation: source.abbreviation,
  fullName: source.fullName,
});

export const seasonLeaderFixture: SeasonLeader = {
  rank: 1,
  tied: false,
  player: {
    id: quarterbackFixture.id,
    displayName: quarterbackFixture.displayName,
    position: 'QB',
    positionGroup: 'QB',
    headshotUrl: quarterbackFixture.headshotUrl,
  },
  metricValue: 4500,
  games: 17,
  season: 2025,
  seasonType: 'REG',
  teamContext: {
    type: 'MULTI',
    teams: [team(billsFixture), team(eaglesFixture)],
  },
  qualifyingContext: null,
};

export const weeklyLeaderFixture: WeeklyLeader = {
  rank: 1,
  tied: false,
  player: seasonLeaderFixture.player,
  metricValue: 325,
  games: 1,
  season: 2025,
  seasonType: 'REG',
  week: 10,
  gameId: '33333333-3333-4333-8333-333333333333',
  gameDate: '2025-11-09T18:00:00.000Z',
  team: team(billsFixture),
  opponent: team(eaglesFixture),
  qualifyingContext: null,
};

export const recentPerformanceFixture: RecentPerformanceResult = {
  player: seasonLeaderFixture.player,
  performances: [
    {
      gameId: weeklyLeaderFixture.gameId,
      season: 2025,
      seasonType: 'REG',
      week: 9,
      gameDate: null,
      team: team(billsFixture),
      opponent: team(eaglesFixture),
      value: null,
    },
    {
      ...weeklyLeaderFixture,
      value: 325,
    },
  ],
  summary: {
    gamesRepresented: 2,
    valuesRepresented: 1,
    missingDataCount: 1,
    average: 325,
    total: 325,
    minimum: 325,
    maximum: 325,
  },
  metric: statsMetricFixtures[0],
  attribution: playerAttributionFixture,
};
