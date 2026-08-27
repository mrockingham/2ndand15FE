import type {
  CuratedVideo,
  GameDisplayVideo,
  GameMediaDisplayMode,
} from '@/features/gameMedia/types';

export const displayModeLabel: Readonly<Record<GameMediaDisplayMode, string>> =
  {
    CURATED: 'Curated media',
    AUTOMATIC: 'Automatic highlight',
    GLOBAL: 'Global video',
    NONE: 'No media',
  };

// Viewer-facing label for a display item's origin -- never expose the raw
// backend `mediaType` enum directly in the UI.
export const mediaTypeLabel: Readonly<
  Record<GameDisplayVideo['mediaType'], string>
> = {
  CURATED: 'Game Video',
  AUTOMATIC: 'Game Highlight',
  GLOBAL: 'Featured Video',
};

export const MAX_CURATED_VIDEOS = 4;

export const canAddCuratedVideo = (count: number) => count < MAX_CURATED_VIDEOS;

// displayMode is always read from the backend response, never derived here
// from array lengths -- no function in this module computes it.

export const sortByPosition = (videos: readonly CuratedVideo[]) =>
  [...videos].sort((a, b) => a.position - b.position);

export const moveVideoOrder = (
  orderedIds: readonly string[],
  videoId: string,
  direction: 'up' | 'down',
): readonly string[] | null => {
  const index = orderedIds.indexOf(videoId);
  if (index === -1) return null;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= orderedIds.length) return null;
  const next = [...orderedIds];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved!);
  return next;
};
