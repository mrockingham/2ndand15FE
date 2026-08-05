export type PlayerSeasonType = 'PRE' | 'REG' | 'POST';
export type PlayerSummaryType = 'REG' | 'POST' | 'REG_POST';

export interface PlayerAttribution {
  readonly source: 'nflverse';
  readonly license: 'CC BY 4.0';
  readonly url: string;
}

export interface PlayerTeamSummary {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName?: string;
}

export interface Player {
  readonly id: string;
  readonly displayName: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly shortName: string | null;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly birthDate: string | null;
  readonly heightInches: number | null;
  readonly weightPounds: number | null;
  readonly college: string | null;
  readonly rookieSeason: number | null;
  readonly lastSeason: number | null;
  readonly draft: {
    readonly year: number;
    readonly round: number | null;
    readonly pick: number | null;
  } | null;
  readonly latestTeam: PlayerTeamSummary | null;
  readonly jerseyNumber: number | null;
  readonly status: string | null;
  readonly headshotUrl: string | null;
}

export interface PassingGameStats {
  readonly completions: number | null;
  readonly attempts: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly interceptions: number | null;
  readonly sacksSuffered: number | null;
  readonly sackYardsLost: number | null;
  readonly airYards: number | null;
  readonly yardsAfterCatch: number | null;
  readonly firstDowns: number | null;
  readonly epa: number | null;
  readonly twoPointConversions: number | null;
}

export interface RushingGameStats {
  readonly carries: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly firstDowns: number | null;
  readonly epa: number | null;
  readonly fumbles: number | null;
  readonly fumblesLost: number | null;
  readonly twoPointConversions: number | null;
}

export interface ReceivingGameStats {
  readonly targets: number | null;
  readonly receptions: number | null;
  readonly yards: number | null;
  readonly touchdowns: number | null;
  readonly airYards: number | null;
  readonly yardsAfterCatch: number | null;
  readonly firstDowns: number | null;
  readonly epa: number | null;
  readonly targetShare: number | null;
  readonly twoPointConversions: number | null;
}

export interface DefenseGameStats {
  readonly tacklesSolo: number | null;
  readonly tacklesWithAssist: number | null;
  readonly tackleAssists: number | null;
  readonly tacklesForLoss: number | null;
  readonly sacks: number | null;
  readonly sackYards: number | null;
  readonly quarterbackHits: number | null;
  readonly interceptions: number | null;
  readonly interceptionYards: number | null;
  readonly passesDefended: number | null;
  readonly forcedFumbles: number | null;
  readonly fumbleRecoveries: number | null;
  readonly touchdowns: number | null;
}

export interface KickingGameStats {
  readonly fieldGoalsMade: number | null;
  readonly fieldGoalsAttempted: number | null;
  readonly extraPointsMade: number | null;
  readonly extraPointsAttempted: number | null;
  readonly punts: number | null;
  readonly puntYards: number | null;
}

export interface ReturnGameStats {
  readonly puntReturnYards: number | null;
  readonly puntReturnTouchdowns: number | null;
  readonly kickoffReturnYards: number | null;
  readonly specialTeamsTouchdowns: number | null;
}

export interface FantasyStats {
  readonly standard: number | null;
  readonly ppr: number | null;
}

export interface PlayerGameStat {
  readonly id: string;
  readonly gameId: string;
  readonly season: number;
  readonly week: number;
  readonly seasonType: PlayerSeasonType;
  readonly startTime: string | null;
  readonly team: PlayerTeamSummary;
  readonly opponent: PlayerTeamSummary;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly passing: PassingGameStats;
  readonly rushing: RushingGameStats;
  readonly receiving: ReceivingGameStats;
  readonly defense: DefenseGameStats;
  readonly kicking: KickingGameStats;
  readonly returns: ReturnGameStats;
  readonly fantasy: FantasyStats;
}

export interface PlayerSeasonStat {
  readonly id: string;
  readonly season: number;
  readonly summaryType: PlayerSummaryType;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly games: number;
  readonly teamCount: number;
  readonly passing: Pick<
    PassingGameStats,
    'completions' | 'attempts' | 'yards' | 'touchdowns' | 'interceptions'
  >;
  readonly rushing: Pick<RushingGameStats, 'carries' | 'yards' | 'touchdowns'>;
  readonly receiving: Pick<
    ReceivingGameStats,
    'targets' | 'receptions' | 'yards' | 'touchdowns'
  >;
  readonly defense: Pick<
    DefenseGameStats,
    | 'tacklesSolo'
    | 'tackleAssists'
    | 'sacks'
    | 'interceptions'
    | 'forcedFumbles'
    | 'touchdowns'
  >;
  readonly kicking: KickingGameStats;
  readonly fantasy: FantasyStats;
}

export interface PlayerListFilters {
  readonly search?: string;
  readonly teamId?: string;
  readonly position?: string;
  readonly season?: number;
  readonly limit?: number;
}

export interface PlayerStatsFilters {
  readonly season?: number;
  readonly week?: number;
  readonly seasonType?: PlayerSeasonType;
  readonly limit?: number;
}

export interface PlayerPage {
  readonly players: readonly Player[];
  readonly nextCursor: string | null;
  readonly attribution: PlayerAttribution;
}

export interface PlayerStatsPage {
  readonly stats: readonly PlayerGameStat[];
  readonly nextCursor: string | null;
  readonly attribution: PlayerAttribution;
}

export interface PlayerDetailResult {
  readonly player: Player;
  readonly attribution: PlayerAttribution;
}

export interface PlayerSeasonsResult {
  readonly seasons: readonly PlayerSeasonStat[];
  readonly attribution: PlayerAttribution;
}
