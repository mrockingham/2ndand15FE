import type { TeamHomepageBanner } from '@/features/teamHub/types';

export type TeamHomepageMediaSourceType =
  'GAME_HIGHLIGHT' | 'CURATED_GAME_VIDEO';

export interface AdminTeamHomepageArticleSource {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly publishedAt: string | null;
  readonly updatedAt: string;
}

export interface AdminTeamHomepageMediaSource {
  readonly sourceType: TeamHomepageMediaSourceType;
  readonly sourceId: string;
  readonly gameId: string;
  readonly title: string;
  readonly thumbnailUrl: string | null;
  readonly canonicalUrl: string | null;
  readonly embedUrl: string | null;
  readonly canEmbed: boolean;
  readonly publishedAt: string | null;
}

interface AdminPlacementBase {
  readonly id: string;
  readonly teamId: string;
  readonly sourceId: string;
  readonly position: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly isAvailable: boolean;
}

export interface AdminEditorialArticlePlacement extends AdminPlacementBase {
  readonly sourceType: 'ARTICLE';
  readonly mediaSourceType: null;
  readonly gameId: null;
  readonly isLeadReplacement: false;
  readonly source: AdminTeamHomepageArticleSource | null;
}

export interface AdminEditorialVideoPlacement extends AdminPlacementBase {
  readonly sourceType: 'VIDEO';
  readonly mediaSourceType: TeamHomepageMediaSourceType;
  readonly gameId: string;
  readonly isLeadReplacement: boolean;
  readonly source: AdminTeamHomepageMediaSource | null;
}

export type AdminEditorialPlacement =
  AdminEditorialArticlePlacement | AdminEditorialVideoPlacement;

export interface AdminHighlightPlacement extends AdminPlacementBase {
  readonly sourceType: TeamHomepageMediaSourceType;
  readonly gameId: string;
  readonly source: AdminTeamHomepageMediaSource | null;
}

export interface TeamHomepageHighlightSettings {
  readonly displayLimit: number;
  readonly fillWithAutomatic: boolean;
}

export interface AdminTeamHomepage {
  readonly banner: TeamHomepageBanner;
  readonly editorial: {
    readonly placements: readonly AdminEditorialPlacement[];
  };
  readonly highlights: {
    readonly placements: readonly AdminHighlightPlacement[];
    readonly settings: TeamHomepageHighlightSettings;
  };
}

export interface EditorialArticleCandidate {
  readonly type: 'ARTICLE';
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly publishedAt: string | null;
  readonly isSelected: boolean;
  readonly isLeadReplacement: false;
}

export interface EditorialVideoCandidate extends AdminTeamHomepageMediaSource {
  readonly type: 'VIDEO';
  readonly id: string;
  readonly mediaSourceType: TeamHomepageMediaSourceType;
  readonly isSelected: boolean;
  readonly isLeadReplacement: boolean;
}

export type EditorialCandidate =
  EditorialArticleCandidate | EditorialVideoCandidate;

export interface CandidatePage<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
}

export interface UpdateTeamBannerInput {
  readonly imageUrl?: string | null;
  readonly focalX?: number;
  readonly focalY?: number;
  readonly overlayOpacity?: number;
}

export type AddEditorialInput =
  | {
      readonly sourceType: 'ARTICLE';
      readonly sourceId: string;
      readonly isLeadReplacement?: false;
    }
  | {
      readonly sourceType: 'VIDEO';
      readonly sourceId: string;
      readonly mediaSourceType: TeamHomepageMediaSourceType;
      readonly isLeadReplacement: boolean;
    };

export interface ReorderPlacementsInput {
  readonly placementIds: readonly string[];
}

export interface AddHighlightInput {
  readonly sourceType: TeamHomepageMediaSourceType;
  readonly sourceId: string;
}

export const MAX_TEAM_EDITORIAL_PLACEMENTS = 8;
export const MAX_TEAM_HIGHLIGHT_PLACEMENTS = 10;
