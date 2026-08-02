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

export interface AdminGameTeam {
  readonly id: string;
  readonly fullName: string;
  readonly abbreviation: string;
  readonly logoUrl: string | null;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface AdminGameValues {
  readonly id: string;
  readonly league: 'NFL';
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly startTime: string;
  readonly status: GameStatus;
  readonly homeTeam: AdminGameTeam;
  readonly awayTeam: AdminGameTeam;
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

export interface GameProvenance {
  readonly sourceType: string;
  readonly sourceName: string;
  readonly sourceUrl: string | null;
  readonly externalReference: string | null;
  readonly notes: string | null;
  readonly importedAt: string;
  readonly verifiedAt: string | null;
  readonly verifiedById: string | null;
}

export interface GameOverride {
  readonly startTime: string | null;
  readonly status: GameStatus | null;
  readonly week: number | null;
  readonly venueName: string | null;
  readonly venueCity: string | null;
  readonly broadcastNetwork: string | null;
  readonly isNeutralSite: boolean | null;
  readonly publicCorrectionNote: string | null;
  readonly internalNote: string | null;
  readonly createdBySnapshot: string;
  readonly updatedBySnapshot: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminGame {
  readonly id: string;
  readonly resolved: AdminGameValues;
  readonly base: AdminGameValues;
  readonly providerManaged: boolean;
  readonly provenance: GameProvenance | null;
  readonly override: GameOverride | null;
}

export interface AdminGameListFilters {
  readonly season?: number;
  readonly limit?: number;
  readonly cursor?: string;
}

export interface AdminGameListPage {
  readonly games: readonly AdminGame[];
  readonly nextCursor: string | null;
}

export interface GameProvenanceInput {
  readonly sourceName: string;
  readonly sourceUrl?: string | null;
  readonly externalReference?: string | null;
  readonly notes?: string | null;
}

export interface ManualGameInput {
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly startTime: string;
  readonly status: GameStatus;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly venueName: string | null;
  readonly venueCity: string | null;
  readonly broadcastNetwork: string | null;
  readonly isNeutralSite: boolean;
}

export interface ManualGameCreateInput extends ManualGameInput {
  readonly provenance: GameProvenanceInput;
}

export type ManualGameUpdateInput = Partial<ManualGameInput>;

export interface GameOverrideInput {
  readonly startTime?: string | null;
  readonly status?: GameStatus | null;
  readonly week?: number | null;
  readonly venueName?: string | null;
  readonly venueCity?: string | null;
  readonly broadcastNetwork?: string | null;
  readonly isNeutralSite?: boolean | null;
  readonly publicCorrectionNote?: string | null;
  readonly internalNote?: string | null;
}

export interface VerificationInput {
  readonly sourceName: string;
  readonly sourceUrl?: string | null;
  readonly note?: string | null;
}

export type ImportSourceType =
  'MANUAL_IMPORT' | 'OFFICIAL_WEB' | 'DEVELOPMENT_FIXTURE';

export interface ScheduleImportRow {
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly startTime: string;
  readonly awayTeam: string;
  readonly homeTeam: string;
  readonly status: GameStatus;
  readonly venueName: string | null;
  readonly venueCity: string | null;
  readonly broadcastNetwork: string | null;
  readonly isNeutralSite: boolean;
  readonly sourceName: string;
  readonly sourceType: ImportSourceType;
  readonly sourceUrl: string | null;
  readonly externalReference: string | null;
  readonly notes: string | null;
}

export interface ScheduleImportResult {
  readonly dryRun: boolean;
  readonly received: number;
  readonly created: number;
  readonly updated: number;
  readonly skipped: number;
  readonly warnings: number;
  readonly failed: number;
  readonly failures: readonly {
    readonly row: number;
    readonly code: string;
    readonly message: string;
  }[];
}

export interface AuditEvent {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly actorEmailSnapshot: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly beforeSnapshot: unknown;
  readonly afterSnapshot: unknown;
  readonly requestId: string | null;
  readonly reason: string | null;
  readonly createdAt: string;
}

export interface AuditFilters {
  readonly limit?: number;
  readonly cursor?: string;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
}

export interface AuditPage {
  readonly events: readonly AuditEvent[];
  readonly nextCursor: string | null;
}
