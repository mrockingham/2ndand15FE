// Field names here mirror the M32 backend contract as specified for this
// milestone plus this codebase's existing DTO conventions (see
// `games/types.ts` GameHighlight). No live schema/OpenAPI file exists in
// this repo to confirm exact envelope/field names against, so these are a
// best-effort mirror -- reconcile against real admin/public responses
// (PHI @ NE) before treating them as final.

export type GameMediaDisplayMode = 'CURATED' | 'AUTOMATIC' | 'NONE';

export interface CuratedVideo {
  readonly id: string;
  readonly gameId: string;
  readonly position: number; // 0-3, contiguous; 0 = primary
  readonly title: string;
  readonly embedUrl: string;
  readonly canonicalUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly sourceLabel: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GameMediaTeamSummary {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
  readonly logoUrl: string | null;
}

// Confirmed against the real backend response: curatedVideoCount /
// automaticHighlightCount / displayMode are flat fields on the game object,
// not nested under a "media" sub-object as originally guessed.
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

// Confirmed against the real backend response: the game is nested under
// `game` (same shape as AdminGameMediaListItem, including its own
// curatedVideoCount/automaticHighlightCount/displayMode), curatedVideos is a
// flat sibling array, and displayMode is duplicated at the top level. There
// is no array of automatic-highlight objects at the admin level -- only the
// count on `game.automaticHighlightCount` -- so the UI can only report a
// count/preserved-state message here, not titles/thumbnails.
export interface AdminGameMediaDetail {
  readonly game: AdminGameMediaListItem;
  readonly curatedVideos: readonly CuratedVideo[];
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

export interface ReorderVideosInput {
  readonly orderedVideoIds: readonly string[];
}

// GET /games/:gameId/media (public). Only `displayMode` and `curatedVideos`
// are actually consumed by the frontend -- the AUTOMATIC branch renders via
// a separate /games/:gameId/highlights call, never data carried here -- so
// no automatic-highlight object shape is assumed for this payload either.
export interface GameMediaResult {
  readonly gameId: string;
  readonly displayMode: GameMediaDisplayMode;
  readonly curatedVideos: readonly CuratedVideo[];
}
