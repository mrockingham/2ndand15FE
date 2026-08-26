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

export interface GamePlayerIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly headshotUrl: string | null;
}

export interface GamePlayerPassingStats {
  readonly player: GamePlayerIdentity;
  readonly completions: number | null;
  readonly attempts: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly interceptions: number | null;
  readonly sacksSuffered: number | null;
  readonly sackYardsLost: number | null;
}

export interface GamePlayerRushingStats {
  readonly player: GamePlayerIdentity;
  readonly attempts: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly longest: number | null;
}

export interface GamePlayerReceivingStats {
  readonly player: GamePlayerIdentity;
  readonly targets: number | null;
  readonly receptions: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly longest: number | null;
}

export interface GamePlayerDefenseStats {
  readonly player: GamePlayerIdentity;
  readonly tacklesTotal: number | null;
  readonly tacklesSolo: number | null;
  readonly sacks: number | null;
  readonly tacklesForLoss: number | null;
  readonly passesDefended: number | null;
  readonly fumbles: number | null;
  readonly fumbleRecoveries: number | null;
  readonly touchdowns: number | null;
}

export interface GamePlayerKickingStats {
  readonly player: GamePlayerIdentity;
  readonly fieldGoalsMade: number | null;
  readonly fieldGoalsAttempted: number | null;
  readonly longestFieldGoal: number | null;
  readonly extraPointsMade: number | null;
  readonly extraPointsAttempted: number | null;
}

export interface GamePlayerPuntingStats {
  readonly player: GamePlayerIdentity;
  readonly punts: number | null;
  readonly yards: number | null;
  readonly average: number | null;
  readonly inside20: number | null;
  readonly touchbacks: number | null;
  readonly longest: number | null;
}

export interface GamePlayerReturnStats {
  readonly player: GamePlayerIdentity;
  readonly kickReturns: number | null;
  readonly kickReturnYards: number | null;
  readonly kickReturnTouchdowns: number | null;
  readonly longestKickReturn: number | null;
  readonly puntReturns: number | null;
  readonly puntReturnYards: number | null;
  readonly puntReturnTouchdowns: number | null;
  readonly longestPuntReturn: number | null;
}

export interface GamePlayerStatsByCategory {
  readonly passing: readonly GamePlayerPassingStats[];
  readonly rushing: readonly GamePlayerRushingStats[];
  readonly receiving: readonly GamePlayerReceivingStats[];
  readonly defense: readonly GamePlayerDefenseStats[];
  readonly kicking: readonly GamePlayerKickingStats[];
  readonly punting: readonly GamePlayerPuntingStats[];
  readonly returns: readonly GamePlayerReturnStats[];
}

export const EMPTY_GAME_PLAYER_STATS: GamePlayerStatsByCategory = {
  passing: [],
  rushing: [],
  receiving: [],
  defense: [],
  kicking: [],
  punting: [],
  returns: [],
};

export interface GameStatsResult {
  readonly gameId: string;
  readonly coverage: GameStatsCoverage;
  readonly teamStats: {
    readonly home: GameTeamStats | null;
    readonly away: GameTeamStats | null;
  };
  readonly playerStatsAvailable: boolean;
  readonly playerStats: {
    readonly home: GamePlayerStatsByCategory;
    readonly away: GamePlayerStatsByCategory;
  };
  readonly limitations: readonly string[];
}

export type GameHighlightCoverage =
  'UNKNOWN' | 'PENDING' | 'AVAILABLE' | 'UNAVAILABLE' | 'PROVIDER_ERROR';

export interface GameHighlight {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly highlightType: string;
  readonly thumbnailUrl: string | null;
  readonly canonicalUrl: string | null;
  readonly embedUrl: string | null;
  // M31C: backend-computed, authoritative inline-playback eligibility --
  // never derived client-side from embedUrl/canonicalUrl host sniffing.
  readonly canEmbed: boolean;
  readonly publishedAt: string | null;
}

export interface GameHighlightsResult {
  readonly gameId: string;
  readonly coverage: GameHighlightCoverage;
  readonly highlights: readonly GameHighlight[];
}
