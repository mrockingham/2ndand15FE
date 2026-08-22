export type SeasonType = 'PRE' | 'REG' | 'POST';

export type GameStatus =
  | 'SCHEDULED'
  | 'PREGAME'
  | 'IN_PROGRESS'
  | 'HALFTIME'
  | 'FINAL'
  | 'POSTPONED'
  | 'CANCELED'
  | 'SUSPENDED';

export interface GameTeam {
  readonly id: string;
  readonly fullName: string;
  readonly abbreviation: string;
  readonly logoUrl: string | null;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface Game {
  readonly id: string;
  readonly league: 'NFL';
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly startTime: string | null;
  readonly status: GameStatus;
  readonly homeTeam: GameTeam;
  readonly awayTeam: GameTeam;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly quarter: number | null;
  readonly clock: string | null;
  readonly venue: {
    readonly name: string | null;
    readonly city: string | null;
  };
  readonly broadcastNetwork: string | null;
  readonly isNeutralSite: boolean;
}

export interface GameListFilters {
  readonly season?: number;
  readonly seasonType?: SeasonType;
  readonly week?: number;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly teamId?: string;
  readonly status?: GameStatus;
  readonly limit?: number;
}

export interface GameListPage {
  readonly games: readonly Game[];
  readonly nextCursor: string | null;
}

export type GamePlayType =
  | 'PASS'
  | 'RUSH'
  | 'PUNT'
  | 'KICKOFF'
  | 'FIELD_GOAL'
  | 'SACK'
  | 'PENALTY'
  | 'TIMEOUT'
  | 'INTERCEPTION'
  | 'FUMBLE'
  | 'END_PERIOD'
  | 'OTHER';

export interface GamePlayPosition {
  readonly down: number | null;
  readonly distance: number | null;
  readonly yardLine: number | null;
}

export interface GamePlay {
  readonly id: string;
  readonly sequence: number;
  readonly period: number;
  readonly clock: string;
  readonly possessionTeam: GameTeam | null;
  readonly type: GamePlayType;
  readonly description: string;
  readonly start: GamePlayPosition;
  readonly end: GamePlayPosition;
  readonly flags: {
    readonly scoring: boolean;
    readonly penalty: boolean;
    readonly turnover: boolean;
  };
}

export interface GamePlaysResult {
  readonly gameId: string;
  readonly playCount: number;
  readonly plays: readonly GamePlay[];
  readonly limitations: readonly string[];
}

export interface GameTeamStats {
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

export type GameStatsCoverage = 'AVAILABLE' | 'UNAVAILABLE';

export interface GameStatsResult {
  readonly gameId: string;
  readonly coverage: GameStatsCoverage;
  readonly teamStats: {
    readonly home: GameTeamStats | null;
    readonly away: GameTeamStats | null;
  };
  readonly limitations: readonly string[];
}
