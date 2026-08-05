export type ArticleType = 'ORIGINAL' | 'CURATED' | 'ANNOUNCEMENT';
export type ArticleStatus =
  'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface ArticleTeam {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
}

export interface PublicArticleListItem {
  readonly id: string;
  readonly slug: string;
  readonly type: ArticleType;
  readonly title: string;
  readonly summary: string | null;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly sourcePublishedAt: string | null;
  readonly heroImageUrl: string | null;
  readonly heroImageAlt: string | null;
  readonly isFeatured: boolean;
  readonly publishedAt: string;
  readonly teams: readonly ArticleTeam[];
}

export interface PublicArticleDetail extends PublicArticleListItem {
  readonly body: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly heroImageAttribution: string | null;
  readonly heroImageAttributionUrl: string | null;
}

export interface AdminArticleListItem {
  readonly id: string;
  readonly slug: string;
  readonly type: ArticleType;
  readonly status: ArticleStatus;
  readonly version: number;
  readonly title: string;
  readonly summary: string | null;
  readonly isFeatured: boolean;
  readonly featuredPriority: number | null;
  readonly publishedAt: string | null;
  readonly scheduledFor: string | null;
  readonly teams: readonly ArticleTeam[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminArticleDetail extends AdminArticleListItem {
  readonly body: string | null;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly sourcePublishedAt: string | null;
  readonly heroImageUrl: string | null;
  readonly heroImageAlt: string | null;
  readonly heroImageAttribution: string | null;
  readonly heroImageAttributionUrl: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly featuredStartsAt: string | null;
  readonly featuredEndsAt: string | null;
}

export interface ArticleEditorialFields {
  readonly type: ArticleType;
  readonly title: string;
  readonly slug?: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly sourcePublishedAt: string | null;
  readonly heroImageUrl: string | null;
  readonly heroImageAlt: string | null;
  readonly heroImageAttribution: string | null;
  readonly heroImageAttributionUrl: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly isFeatured: boolean;
  readonly featuredPriority: number | null;
  readonly featuredStartsAt: string | null;
  readonly featuredEndsAt: string | null;
}

export interface ArticleCreateInput extends ArticleEditorialFields {
  readonly teamIds: readonly string[];
  readonly changeSummary?: string | null;
}
export type ArticleUpdateInput = Partial<ArticleEditorialFields> & {
  readonly expectedVersion: number;
  readonly changeSummary?: string | null;
};
export interface ArticleVersionActionInput {
  readonly expectedVersion: number;
  readonly changeSummary?: string | null;
}
export interface ArticleTeamsInput extends ArticleVersionActionInput {
  readonly teamIds: readonly string[];
}
export interface ArticleScheduleInput extends ArticleVersionActionInput {
  readonly scheduledFor: string;
}

export interface PublicArticleFilters {
  readonly limit?: number;
  readonly cursor?: string;
  readonly type?: ArticleType;
  readonly teamId?: string;
  readonly team?: string;
  readonly featured?: boolean;
  readonly publishedFrom?: string;
  readonly publishedTo?: string;
  readonly search?: string;
}
export interface AdminArticleFilters {
  readonly limit?: number;
  readonly cursor?: string;
  readonly status?: ArticleStatus;
  readonly type?: ArticleType;
  readonly teamId?: string;
  readonly featured?: boolean;
  readonly authorId?: string;
  readonly search?: string;
}
export interface ArticlePage<T> {
  readonly articles: readonly T[];
  readonly nextCursor: string | null;
}

export interface ArticleRevision {
  readonly id: string;
  readonly articleId: string;
  readonly revisionNumber: number;
  readonly editorSnapshot: string;
  readonly snapshot: unknown;
  readonly changeSummary: string | null;
  readonly createdAt: string;
}
export interface RevisionPage {
  readonly revisions: readonly ArticleRevision[];
  readonly nextCursor: string | null;
}
export type ArticleLifecycleAction =
  'publish' | 'unpublish' | 'archive' | 'restore';
