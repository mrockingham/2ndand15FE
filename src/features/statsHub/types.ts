import type { PlayerAttribution } from '@/features/players/types';

export type StatsView = 'season' | 'week';
export type StatsSeasonType = 'REG' | 'POST' | 'REG_POST';
export type StatsWeeklySeasonType = Exclude<StatsSeasonType, 'REG_POST'>;

export interface StatsMetric {
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly category: string;
  readonly valueType: 'INTEGER' | 'DECIMAL';
  readonly sortDirection: 'DESC';
  readonly higherIsBetter: boolean;
  readonly availableForSeasonLeaders: boolean;
  readonly availableForWeekLeaders: boolean;
  readonly availableForRecentPerformance: boolean;
  readonly nullableBehavior: 'EXCLUDE';
  readonly decimalPlaces: number;
  readonly qualification: null;
}

export interface StatsMetadata {
  readonly apiVersion: string;
  readonly availableSeasons: readonly number[];
  readonly seasonTypes: {
    readonly seasonLeaders: readonly StatsSeasonType[];
    readonly weeklyLeaders: readonly StatsWeeklySeasonType[];
    readonly recentPerformance: readonly StatsWeeklySeasonType[];
  };
  readonly categories: readonly {
    readonly id: string;
    readonly label: string;
  }[];
  readonly metrics: readonly StatsMetric[];
  readonly positions: readonly string[];
  readonly positionGroups: readonly string[];
  readonly limits: {
    readonly leaderboards: {
      readonly default: number;
      readonly maximum: number;
    };
    readonly recentGames: {
      readonly default: number;
      readonly maximum: number;
    };
  };
  readonly ranking: {
    readonly method: 'COMPETITION';
    readonly tieExample: readonly number[];
    readonly tieOrder: readonly string[];
  };
  readonly coverageNotes: readonly string[];
}

export interface StatsMetadataResult {
  readonly metadata: StatsMetadata;
  readonly attribution: PlayerAttribution;
}

export interface StatsPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly headshotUrl: string | null;
}

export interface StatsTeam {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
}

interface RankedStatsRow {
  readonly rank: number;
  readonly tied: boolean;
  readonly player: StatsPlayer;
  readonly metricValue: number;
  readonly games: number;
}

export interface SeasonLeader extends RankedStatsRow {
  readonly season: number;
  readonly seasonType: StatsSeasonType;
  readonly teamContext: {
    readonly type: 'NONE' | 'SINGLE' | 'MULTI';
    readonly teams: readonly StatsTeam[];
  };
  readonly qualifyingContext: null;
}

export interface WeeklyLeader extends RankedStatsRow {
  readonly season: number;
  readonly seasonType: StatsWeeklySeasonType;
  readonly week: number;
  readonly gameId: string;
  readonly gameDate: string | null;
  readonly team: StatsTeam;
  readonly opponent: StatsTeam;
  readonly qualifyingContext: null;
}

export interface LeaderboardFilters {
  readonly season: number;
  readonly seasonType: StatsSeasonType;
  readonly metric: string;
  readonly week?: number;
  readonly position?: string;
  readonly positionGroup?: string;
  readonly teamId?: string;
  readonly limit: number;
}

export interface LeaderboardPage<Row> {
  readonly rows: readonly Row[];
  readonly nextCursor: string | null;
  readonly metric: StatsMetric;
  readonly attribution: PlayerAttribution;
}

export interface RecentPerformanceFilters {
  readonly playerId: string;
  readonly metric: string;
  readonly season?: number;
  readonly seasonType?: StatsWeeklySeasonType;
  readonly games: number;
}

export interface RecentPerformance {
  readonly gameId: string;
  readonly season: number;
  readonly seasonType: StatsWeeklySeasonType;
  readonly week: number;
  readonly gameDate: string | null;
  readonly team: StatsTeam;
  readonly opponent: StatsTeam;
  readonly value: number | null;
}

export interface RecentPerformanceResult {
  readonly player: StatsPlayer;
  readonly performances: readonly RecentPerformance[];
  readonly summary: {
    readonly gamesRepresented: number;
    readonly valuesRepresented: number;
    readonly missingDataCount: number;
    readonly average: number | null;
    readonly total: number | null;
    readonly minimum: number | null;
    readonly maximum: number | null;
  };
  readonly metric: StatsMetric;
  readonly attribution: PlayerAttribution;
}

export interface NormalizedStatsUrlState {
  readonly view: StatsView;
  readonly season: number;
  readonly seasonType: StatsSeasonType;
  readonly week?: number;
  readonly category: string;
  readonly metric: string;
  readonly teamId?: string;
  readonly position?: string;
  readonly positionGroup?: string;
  readonly recentPlayerId?: string;
  readonly recentSeason?: number;
  readonly recentSeasonType?: StatsWeeklySeasonType;
  readonly recentGames: number;
}
