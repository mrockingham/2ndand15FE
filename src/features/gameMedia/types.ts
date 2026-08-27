// Field/envelope shapes on this page are all live-verified against the real
// backend (curl, ADMIN session) as of M32C -- see the M32B lesson that
// prose-derived shapes drift from reality. Do not hand-edit field names
// without re-verifying against a live response.

import type {
  GameHighlight,
  GameHighlightCoverage,
} from '@/features/games/types';

export type GameMediaDisplayMode = 'CURATED' | 'AUTOMATIC' | 'GLOBAL' | 'NONE';

export interface CuratedVideo {
  readonly id: string;
  readonly position: number; // 0-3, contiguous
  readonly isPrimary: boolean; // backend-computed; equivalent to position === 0
  readonly title: string;
  readonly embedUrl: string;
  readonly canonicalUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly sourceLabel: string | null;
  // Present on admin responses, absent from the public /media payload.
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

// The single globally-configured Game Center video. One DB record, never
// copied per game, never counted against a game's 4-curated-video cap.
export interface GlobalVideo {
  readonly id: string;
  readonly title: string;
  readonly embedUrl: string;
  readonly canonicalUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly sourceLabel: string | null;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface GameMediaTeamSummary {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
  readonly logoUrl: string | null;
}

export interface AdminGameMediaListItem {
  readonly gameId: string;
  readonly season: number;
  readonly seasonType: 'PRE' | 'REG' | 'POST';
  readonly week: number | null;
  readonly startTime: string | null;
  readonly status: string;
  readonly homeTeam: GameMediaTeamSummary;
  readonly awayTeam: GameMediaTeamSummary;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly curatedVideoCount: number;
  readonly automaticHighlightCount: number;
  readonly hasGlobalVideo: boolean;
  readonly displayMode: GameMediaDisplayMode;
}

export interface AdminGameMediaListFilters {
  readonly season?: number;
  readonly seasonType?: 'PRE' | 'REG' | 'POST';
  readonly week?: number;
}

export interface AdminGameMediaListPage {
  readonly games: readonly AdminGameMediaListItem[];
  readonly nextCursor: string | null;
}

export interface AdminGameMediaDetail {
  readonly game: AdminGameMediaListItem;
  readonly curatedVideos: readonly CuratedVideo[];
  readonly globalVideo: GlobalVideo | null;
  readonly displayMode: GameMediaDisplayMode;
}

export interface CuratedVideoInput {
  readonly title: string;
  readonly embedUrl: string;
  readonly canonicalUrl?: string;
  readonly thumbnailUrl?: string;
  readonly sourceLabel?: string;
}

export type CuratedVideoUpdateInput = Partial<CuratedVideoInput>;

// Same field shape as CuratedVideoInput; kept as a distinct alias since the
// global-video PUT endpoint is a separate concept even though the body
// happens to match today.
export type GlobalVideoInput = CuratedVideoInput;

export interface ReorderVideosInput {
  readonly orderedVideoIds: readonly string[];
}

// A single item in the backend's authoritative, pre-ordered viewer
// playlist. The frontend never recomputes this ordering -- it only ever
// renders `displayVideos` in the order the backend returns.
export interface GameDisplayVideo {
  readonly id: string;
  readonly mediaType: 'CURATED' | 'AUTOMATIC' | 'GLOBAL';
  readonly title: string;
  readonly embedUrl: string | null;
  readonly canonicalUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly sourceLabel: string | null;
  readonly canEmbed: boolean;
}

// GET /games/:gameId/media (public)
export interface GameMediaResult {
  readonly gameId: string;
  readonly displayMode: GameMediaDisplayMode;
  readonly curatedVideos: readonly CuratedVideo[];
  readonly highlights: readonly GameHighlight[];
  readonly globalVideo: GlobalVideo | null;
  readonly displayVideos: readonly GameDisplayVideo[];
  readonly coverage: GameHighlightCoverage;
}
