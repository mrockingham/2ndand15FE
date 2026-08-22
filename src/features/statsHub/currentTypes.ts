import type { Game, SeasonType } from '@/features/games/types';

export type CurrentStatsCoverage =
  'PENDING' | 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';

export interface CurrentGameTeamStats {
  readonly teamId: string;
  readonly firstDowns: number | null;
  readonly totalPlays: number | null;
  readonly totalYards: number | null;
  readonly passingYards: number | null;
  readonly rushingYards: number | null;
  readonly turnovers: number | null;
  readonly sacks: number | null;
  readonly thirdDownConversions: number | null;
  readonly thirdDownAttempts: number | null;
  readonly fourthDownConversions: number | null;
  readonly fourthDownAttempts: number | null;
  readonly penalties: number | null;
  readonly penaltyYards: number | null;
  readonly possessionSeconds: number | null;
  readonly redZoneConversions: number | null;
  readonly redZoneAttempts: number | null;
  readonly scoringByPeriod: {
    readonly q1: number | null;
    readonly q2: number | null;
    readonly q3: number | null;
    readonly q4: number | null;
    readonly ot1: number | null;
    readonly ot2: number | null;
  };
}

export interface CurrentStatsGame {
  readonly game: Game;
  readonly coverage: CurrentStatsCoverage;
  readonly teamStats: {
    readonly home: CurrentGameTeamStats | null;
    readonly away: CurrentGameTeamStats | null;
  };
}

export interface CurrentStatsResult {
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | 'ALL';
  readonly games: readonly CurrentStatsGame[];
  readonly availableSeasons: readonly number[];
  readonly availableSeasonTypes: readonly SeasonType[];
  readonly availableWeeks: readonly number[];
  readonly coverageNote: string;
}

export interface CurrentStatsFilters {
  readonly season?: number;
  readonly seasonType?: SeasonType;
  readonly week?: number | 'ALL';
  readonly teamId?: string;
}
