import type { AdminArticleDetail } from '@/features/articles/types';

export type NewsSourceKind = 'RSS' | 'ATOM' | 'MANUAL_ONLY';
export type NewsContentType = 'ARTICLE' | 'VIDEO' | 'HIGHLIGHT';
export type NewsSourceStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED' | 'ERROR';
export type NewsCandidateStatus =
  'NEW' | 'REVIEWING' | 'SAVED' | 'CONVERTED' | 'DISMISSED';
export type NewsIngestionRunStatus =
  'RUNNING' | 'SUCCEEDED' | 'PARTIAL' | 'FAILED';

export interface NewsSource {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly kind: NewsSourceKind;
  readonly contentType: NewsContentType;
  readonly status: NewsSourceStatus;
  readonly feedUrl: string | null;
  readonly siteUrl: string;
  readonly publisherName: string;
  readonly defaultTeam: {
    readonly id: string;
    readonly abbreviation: string;
    readonly fullName: string;
  } | null;
  readonly isOfficialLeague: boolean;
  readonly isOfficialTeam: boolean;
  readonly allowsDescriptionUse: boolean;
  readonly notes: string | null;
  readonly health: {
    readonly lastCheckedAt: string | null;
    readonly lastSuccessfulAt: string | null;
    readonly lastErrorCode: string | null;
    readonly lastErrorSummary: string | null;
    readonly lastItemCount: number;
    readonly consecutiveFailureCount: number;
    readonly hasEtag: boolean;
    readonly hasModifiedValidator: boolean;
    readonly runActive: boolean;
  };
  readonly createdBySnapshot: string;
  readonly updatedBySnapshot: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NewsIngestionRun {
  readonly id: string;
  readonly sourceId: string;
  readonly status: NewsIngestionRunStatus;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly fetchedCount: number;
  readonly createdCount: number;
  readonly updatedCount: number;
  readonly skippedCount: number;
  readonly failedCount: number;
  readonly responseBytes: number | null;
  readonly hasResponseEtag: boolean;
  readonly hasResponseModified: boolean;
  readonly errorCode: string | null;
  readonly errorSummary: string | null;
  readonly initiatedBySnapshot: string;
}

export interface NewsSourceDetail {
  readonly source: NewsSource;
  readonly recentRuns: readonly NewsIngestionRun[];
}

export interface NewsSourceListFilters {
  readonly limit?: number;
  readonly status?: NewsSourceStatus;
  readonly kind?: NewsSourceKind;
}

export interface NewsSourceInput {
  readonly name: string;
  readonly slug: string;
  readonly kind: NewsSourceKind;
  readonly status: Exclude<NewsSourceStatus, 'ERROR'>;
  readonly feedUrl: string | null;
  readonly siteUrl: string;
  readonly publisherName: string;
  readonly defaultTeamId: string | null;
  readonly isOfficialLeague: boolean;
  readonly isOfficialTeam: boolean;
  readonly allowsDescriptionUse: boolean;
  readonly notes: string | null;
}

export type NewsSourceUpdateInput = Partial<NewsSourceInput>;

export interface NewsSourcePage {
  readonly sources: readonly NewsSource[];
  readonly nextCursor: string | null;
}

export interface NewsCandidateSource {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly publisherName: string;
  readonly isOfficialTeam: boolean;
}

export interface SuggestedTeam {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
  readonly rule: string;
}

export interface NewsCandidateListItem {
  readonly id: string;
  readonly source: NewsCandidateSource | null;
  readonly sourceName: string;
  readonly canonicalUrl: string;
  readonly headline: string;
  readonly sourceAuthor: string | null;
  readonly contentType: NewsContentType;
  readonly thumbnailUrl: string | null;
  readonly sourcePublishedAt: string | null;
  readonly discoveredAt: string;
  readonly status: NewsCandidateStatus;
  readonly convertedArticleId: string | null;
  readonly suggestedTeams: readonly SuggestedTeam[];
  readonly updatedAt: string;
}

export interface NewsCandidateDetail extends NewsCandidateListItem {
  readonly sourceExternalId: string | null;
  readonly sourceDescription: string | null;
  readonly dismissalReason: string | null;
  readonly reviewedBySnapshot: string | null;
  readonly reviewedAt: string | null;
  readonly createdAt: string;
}

export interface NewsCandidateListFilters {
  readonly limit?: number;
  readonly status?: NewsCandidateStatus;
  readonly sourceId?: string;
  readonly teamId?: string;
  readonly publishedFrom?: string;
  readonly publishedTo?: string;
  readonly search?: string;
}

export interface NewsCandidatePage {
  readonly candidates: readonly NewsCandidateListItem[];
  readonly nextCursor: string | null;
}

export interface ManualCandidateInput {
  readonly url: string;
  readonly headline: string;
  readonly sourceName: string;
  readonly sourceId: string | null;
  readonly sourceDescription: string | null;
  readonly sourceAuthor: string | null;
  readonly sourcePublishedAt: string | null;
  readonly suggestedTeamIds: readonly string[];
}

export interface CandidateConvertInput {
  readonly title: string;
  readonly slug?: string;
  readonly originalSummary: string;
  readonly originalCommentary: string | null;
  readonly confirmedTeamIds: readonly string[];
  readonly heroImageUrl: string | null;
  readonly heroImageAlt: string | null;
  readonly heroImageAttribution: string | null;
  readonly heroImageAttributionUrl: string | null;
  readonly changeSummary: string | null;
}

export interface IngestionResult {
  readonly sourceId: string;
  readonly sourceSlug: string;
  readonly testedOnly: boolean;
  readonly notModified: boolean;
  readonly feedKind: 'RSS' | 'ATOM' | null;
  readonly run: NewsIngestionRun;
}

export interface CandidateConversionResult {
  readonly candidate: NewsCandidateDetail;
  readonly article: AdminArticleDetail;
}
