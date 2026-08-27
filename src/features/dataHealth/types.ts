import type { GameStatus, SeasonType } from '@/features/games/types';

export type DataHealthCoverageState =
  'COMPLETE' | 'PARTIAL' | 'MISSING' | 'PENDING' | 'UNAVAILABLE' | 'UNKNOWN';

export type ResultDiagnosisCode =
  | 'RESULT_COMPLETE'
  | 'RESULT_PENDING'
  | 'PROVIDER_RESULT_MISSING'
  | 'RESULT_USING_EDITORIAL_FALLBACK'
  | 'RESULT_CONFLICT'
  | 'PROVIDER_HAS_RESULT_DB_MISSING'
  | 'PROVIDER_REQUEST_FAILED'
  | 'MISSING_PROVIDER_MAPPING'
  | 'PROBE_REQUIRED';

export type TeamStatsDiagnosisCode =
  | 'NOT_EXPECTED_YET'
  | 'MISSING_PROVIDER_MAPPING'
  | 'PROVIDER_NO_TEAM_STATS'
  | 'PROVIDER_HAS_TEAM_STATS_DB_MISSING'
  | 'DB_TEAM_STATS_PARTIAL'
  | 'TEAM_STATS_COMPLETE'
  | 'PROVIDER_REQUEST_FAILED'
  | 'PROBE_REQUIRED';

export type PlayerStatsDiagnosisCode =
  | 'NOT_EXPECTED_YET'
  | 'MISSING_PROVIDER_MAPPING'
  | 'PROVIDER_NO_PLAYER_STATS'
  | 'PROVIDER_HAS_PLAYER_STATS_DB_MISSING'
  | 'PLAYER_IDENTITY_UNRESOLVED'
  | 'DB_PLAYER_STATS_PARTIAL'
  | 'PLAYER_STATS_COMPLETE'
  | 'PROVIDER_REQUEST_FAILED'
  | 'PROBE_REQUIRED';

export type PlaysDiagnosisCode =
  | 'PLAYS_PENDING'
  | 'MISSING_PROVIDER_MAPPING'
  | 'PROVIDER_NO_PLAYS'
  | 'PROVIDER_HAS_PLAYS_DB_MISSING'
  | 'PLAYS_PARTIAL'
  | 'PLAYS_COMPLETE'
  | 'PLAYS_REVIEW_REQUIRED'
  | 'PROVIDER_REQUEST_FAILED'
  | 'PROBE_REQUIRED';

export interface DataHealthTeamSummary {
  readonly id: string;
  readonly abbreviation: string;
  readonly name: string;
}

export interface DataHealthListProbeSummary {
  readonly checkedAt: string;
  readonly providerReachable: boolean;
  readonly playerStatsDiagnosis: PlayerStatsDiagnosisCode;
  readonly teamStatsDiagnosis: TeamStatsDiagnosisCode;
  readonly resultDiagnosis: ResultDiagnosisCode;
  readonly playsDiagnosis: PlaysDiagnosisCode;
}

export interface DataHealthGameRow {
  readonly gameId: string;
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly kickoff: string | null;
  readonly status: GameStatus;
  readonly awayTeam: DataHealthTeamSummary;
  readonly homeTeam: DataHealthTeamSummary;
  readonly result: {
    readonly state: DataHealthCoverageState;
    readonly homeScore: number | null;
    readonly awayScore: number | null;
    readonly source: 'PROVIDER' | 'EDITORIAL_FALLBACK' | 'NONE';
    readonly reasonCode: ResultDiagnosisCode;
  };
  readonly providerMapping: { readonly available: boolean };
  readonly teamStats: {
    readonly state: DataHealthCoverageState;
    readonly rowCount: number;
    readonly expectedRowCount: 2;
    readonly reasonCode: TeamStatsDiagnosisCode;
  };
  readonly playerStats: {
    readonly state: DataHealthCoverageState;
    readonly rowCount: number;
    readonly playerCount: number;
    readonly reasonCode: PlayerStatsDiagnosisCode;
  };
  readonly plays: {
    readonly state: DataHealthCoverageState;
    readonly activeCount: number;
    readonly reviewRequired: boolean;
  };
  readonly lastProbe: DataHealthListProbeSummary | null;
  readonly needsInvestigation: boolean;
}

export interface DataHealthSummary {
  readonly games: number;
  readonly resultsComplete: number;
  readonly resultsMissing: number;
  readonly teamStatsComplete: number;
  readonly teamStatsMissing: number;
  readonly playerStatsComplete: number;
  readonly playerStatsMissing: number;
  readonly playsAvailable: number;
  readonly needsInvestigation: number;
}

export interface DataHealthGameListPage {
  readonly games: readonly DataHealthGameRow[];
  readonly summary: DataHealthSummary;
  readonly nextCursor: string | null;
}

export interface DataHealthGameListFilters {
  readonly season?: number;
  readonly seasonType?: SeasonType;
  readonly week?: number;
  readonly teamId?: string;
  readonly gameStatus?: GameStatus;
  readonly issuesOnly?: boolean;
  readonly limit?: number;
  readonly cursor?: string;
}

export interface DataHealthDetailProbeSummary {
  readonly checkedAt: string;
  readonly provider: string;
  readonly requestCount: number;
  readonly durationMs: number;
  readonly providerReachable: boolean;
  readonly providerMatchFound: boolean;
  readonly resultDiagnosis: ResultDiagnosisCode;
  readonly teamStatsDiagnosis: TeamStatsDiagnosisCode;
  readonly playerStatsDiagnosis: PlayerStatsDiagnosisCode;
  readonly playsDiagnosis: PlaysDiagnosisCode;
  readonly errorCode: string | null;
}

export interface DataHealthGameDetail {
  readonly gameId: string;
  readonly status: GameStatus;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly hasResultFallback: boolean;
  readonly providerMapping: { readonly available: boolean };
  readonly result: {
    readonly state: DataHealthCoverageState;
    readonly reasonCode: ResultDiagnosisCode;
  };
  readonly teamStats: {
    readonly state: DataHealthCoverageState;
    readonly rowCount: number;
    readonly rows: readonly {
      readonly teamId: string;
      readonly isHome: boolean;
      readonly sourceProvider: string;
      readonly sourceUpdatedAt: string;
    }[];
    readonly reasonCode: TeamStatsDiagnosisCode;
  };
  readonly playerStats: {
    readonly state: DataHealthCoverageState;
    readonly totalRows: number;
    readonly uniquePlayers: number;
    readonly homeRows: number;
    readonly awayRows: number;
    readonly latestSourceUpdatedAt: string | null;
    readonly coverage: {
      readonly providerRows: number;
      readonly resolvedRows: number;
      readonly unresolvedRows: number;
    } | null;
    readonly reasonCode: PlayerStatsDiagnosisCode;
  };
  readonly plays: {
    readonly state: DataHealthCoverageState;
    readonly activeCount: number;
    readonly supersededCount: number;
    readonly reviewRequired: boolean;
    readonly blockedAt: string | null;
    readonly blockReason: string | null;
  };
  readonly poller: {
    readonly schedulingClass: string;
    readonly lastAttemptAt: string | null;
    readonly lastSuccessAt: string | null;
    readonly nextPollAt: string | null;
    readonly lastError: string | null;
  } | null;
  readonly lastProbe: DataHealthDetailProbeSummary | null;
}

export interface DataHealthProbeRecord {
  readonly id: string;
  readonly checkedAt: string;
  readonly requestCount: number;
  readonly durationMs: number;
  readonly providerReachable: boolean;
  readonly providerMatchFound: boolean;
  readonly quotaLimit: number | null;
  readonly quotaRemaining: number | null;
  readonly resultDiagnosis: ResultDiagnosisCode;
  readonly teamStatsDiagnosis: TeamStatsDiagnosisCode;
  readonly playerStatsDiagnosis: PlayerStatsDiagnosisCode;
  readonly playsDiagnosis: PlaysDiagnosisCode;
  readonly providerTeamStatRows: number | null;
  readonly dbTeamStatRows: number | null;
  readonly providerPlayerStatRows: number | null;
  readonly normalizedPlayerStatRows: number | null;
  readonly resolvedPlayerCount: number | null;
  readonly unresolvedPlayerCount: number | null;
  readonly dbPlayerStatRows: number | null;
  readonly providerPlayCount: number | null;
  readonly dbPlayCount: number | null;
  readonly errorCode: string | null;
}

export interface DataHealthProbeResult {
  readonly gameId: string;
  readonly checkedAt: string;
  readonly provider: {
    readonly reachable: boolean;
    readonly matchFound: boolean;
    readonly requestCount: number;
    readonly durationMs: number;
    readonly quotaLimit: number | null;
    readonly quotaRemaining: number | null;
  };
  readonly result: {
    readonly providerAvailable: boolean;
    readonly providerStatus: string | null;
    readonly scoreAvailable: boolean;
    readonly diagnosis: ResultDiagnosisCode;
    readonly explanation: string;
  };
  readonly teamStats: {
    readonly providerAvailable: boolean;
    readonly rawRows: number;
    readonly normalizedRows: number;
    readonly databaseRows: number;
    readonly diagnosis: TeamStatsDiagnosisCode;
    readonly explanation: string;
  };
  readonly playerStats: {
    readonly providerAvailable: boolean;
    readonly rawRows: number;
    readonly normalizedRows: number;
    readonly resolvedPlayers: number;
    readonly unresolvedPlayers: number;
    readonly databaseRows: number;
    readonly diagnosis: PlayerStatsDiagnosisCode;
    readonly explanation: string;
  };
  readonly plays: {
    readonly providerAvailable: boolean;
    readonly rawCount: number;
    readonly normalizedCount: number;
    readonly databaseActiveCount: number;
    readonly diagnosis: PlaysDiagnosisCode;
    readonly explanation: string;
  };
}
