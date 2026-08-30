export type PowerRankingConference = 'AFC' | 'NFC';
export type PowerRankingDivision = 'East' | 'North' | 'South' | 'West';

export interface PowerRankingTeam {
  readonly id: string;
  readonly name: string;
  readonly abbreviation: string;
  readonly conference: PowerRankingConference;
  readonly division: PowerRankingDivision;
}

export interface PowerRankingVideo {
  readonly embedUrl: string;
  readonly title: string;
}

export interface PowerRankingEntry {
  readonly id?: string;
  readonly rank: number;
  readonly previousRank: number | null;
  readonly movement: number | null;
  readonly tier: string;
  readonly headline: string;
  readonly summary: string;
  readonly strengths: readonly string[];
  readonly concerns: readonly string[];
  readonly team: PowerRankingTeam;
}

export interface PowerRankingEdition {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly season: number;
  readonly edition: string;
  readonly asOf: string;
  readonly methodology: string;
  readonly sources: readonly string[];
  readonly publishedAt: string | null;
  /** Optional video slot -- not yet part of the backend contract. The module
   * that renders this stays dormant until the backend adds it. */
  readonly video?: PowerRankingVideo | null;
}

export interface PowerRankingsData {
  readonly edition: PowerRankingEdition;
  readonly rankings: readonly PowerRankingEntry[];
}

export interface PowerRankingsFilters {
  readonly season?: number;
  readonly edition?: string;
}

export type PowerRankingEditionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PowerRankingEditionSummary {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly season: number;
  readonly edition: string;
  readonly asOf: string;
  readonly status: PowerRankingEditionStatus;
  readonly publishedAt: string | null;
}

export interface AdminPowerRankingEdition {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly season: number;
  readonly edition: string;
  readonly asOf: string;
  readonly methodology: string;
  readonly sources: readonly string[];
  readonly status: PowerRankingEditionStatus;
  readonly publishedAt: string | null;
  readonly video?: PowerRankingVideo | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminPowerRankingEntry {
  readonly id: string;
  readonly rank: number;
  readonly previousRank: number | null;
  readonly movement: number | null;
  readonly tier: string;
  readonly headline: string;
  readonly summary: string;
  readonly strengths: readonly string[];
  readonly concerns: readonly string[];
  readonly team: PowerRankingTeam;
}

export interface AdminPowerRankingEditionDetail {
  readonly edition: AdminPowerRankingEdition;
  readonly entries: readonly AdminPowerRankingEntry[];
}

export interface CreatePowerRankingEditionInput {
  readonly title: string;
  readonly subtitle: string;
  readonly season: number;
  readonly edition: string;
  readonly asOf: string;
  readonly methodology?: string;
  readonly sources?: readonly string[];
}

export type UpdatePowerRankingEditionInput =
  Partial<CreatePowerRankingEditionInput>;

export interface UpdatePowerRankingEntryInput {
  readonly tier?: string;
  readonly headline?: string;
  readonly summary?: string;
  readonly strengths?: readonly string[];
  readonly concerns?: readonly string[];
}

export interface ReorderPowerRankingEntriesInput {
  readonly entryIds: readonly string[];
}

export type PowerRankingImportMode = 'PREVIEW' | 'UPSERT';

export interface PowerRankingImportInput {
  readonly mode: PowerRankingImportMode;
  readonly payload: unknown;
}

export interface PowerRankingImportIssue {
  readonly message: string;
  readonly path?: string;
}

export interface PowerRankingImportResult {
  readonly mode: PowerRankingImportMode;
  readonly season: number | null;
  readonly edition: string | null;
  readonly asOf: string | null;
  readonly foundCount: number;
  readonly matchedTeams: number;
  readonly errors: readonly PowerRankingImportIssue[];
  readonly warnings: readonly PowerRankingImportIssue[];
  readonly editionId?: string;
}

export const POWER_RANKING_TIERS = [
  'Elite contenders',
  'Strong playoff contenders',
  'In the mix',
  'Fringe contenders',
  'Still figuring it out',
  'Long shots',
] as const;
