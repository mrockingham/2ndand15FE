import { useEffect, useMemo, useState } from 'react';

import type { PlayDeckDirection } from '@/features/games/components/PlayDeck';
import { buildPlayAnimation } from '@/features/games/playVisualization';
import type { GamePlay } from '@/features/games/types';

const MIN_AUTOPLAY_STEP_MS = 1200;
const AUTOPLAY_PAUSE_AFTER_MS = 900;
const REDUCED_MOTION_STEP_MS = 1800;

/**
 * Shared prev/play/next/first navigation used by both the 2D and 3D play
 * visualizers. Advancing selection always goes through the caller's
 * `onSelectPlay`, so this never introduces a second source of truth for
 * which play is selected — Game Center's existing selection state stays
 * authoritative.
 */
export const usePlayPlaybackNavigation = ({
  play,
  plays,
  reduceMotion,
  onSelectPlay,
}: {
  readonly play: GamePlay;
  readonly plays: readonly GamePlay[];
  readonly reduceMotion: boolean;
  readonly onSelectPlay: (playId: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stackDirection, setStackDirection] =
    useState<PlayDeckDirection>('forward');

  const orderedPlays = useMemo(
    () => [...plays].sort((left, right) => left.sequence - right.sequence),
    [plays],
  );
  const currentIndex = orderedPlays.findIndex((item) => item.id === play.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < orderedPlays.length - 1;

  const jumpTo = (playId: string) => {
    setIsPlaying(false);
    const targetIndex = orderedPlays.findIndex((item) => item.id === playId);
    setStackDirection(targetIndex >= currentIndex ? 'forward' : 'backward');
    onSelectPlay(playId);
  };

  const goToFirst = () => {
    if (!hasPrevious) return;
    jumpTo(orderedPlays[0]!.id);
  };
  const goToPrevious = () => {
    if (!hasPrevious) return;
    jumpTo(orderedPlays[currentIndex - 1]!.id);
  };
  const goToNext = () => {
    if (!hasNext) {
      setIsPlaying(false);
      return;
    }
    setStackDirection('forward');
    onSelectPlay(orderedPlays[currentIndex + 1]!.id);
  };

  useEffect(() => {
    if (!isPlaying || !hasNext) return;
    const stepMs = reduceMotion
      ? REDUCED_MOTION_STEP_MS
      : Math.max(buildPlayAnimation(play).durationMs, MIN_AUTOPLAY_STEP_MS) +
        AUTOPLAY_PAUSE_AFTER_MS;
    const timer = setTimeout(goToNext, stepMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, play.id, hasNext, reduceMotion]);

  return {
    orderedPlays,
    currentIndex,
    hasPrevious,
    hasNext,
    isPlaying: isPlaying && hasNext,
    stackDirection,
    goToFirst,
    goToPrevious,
    goToNext,
    jumpTo,
    togglePlaying: () => setIsPlaying((current) => !current),
  };
};
