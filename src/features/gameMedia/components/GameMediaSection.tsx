import type { UseQueryResult } from '@tanstack/react-query';

import { CuratedMediaPlayer } from '@/features/gameMedia/components/CuratedMediaPlayer';
import type { GameMediaResult } from '@/features/gameMedia/types';
import { GameHighlightsSection } from '@/features/games/components/GameHighlightsSection';
import { useGameHighlightsQuery } from '@/features/games/queries';
import type { Game } from '@/features/games/types';

export const GameMediaSection = ({
  game,
  query,
}: {
  readonly game: Game;
  readonly query: UseQueryResult<GameMediaResult, unknown>;
}) => {
  const displayMode = query.data?.displayMode;

  // The mode decision always comes from the /media endpoint; the AUTOMATIC
  // branch reuses the existing highlights query only for its rendering data
  // (unchanged GameHighlightsSection), never to decide the mode itself.
  const highlightsQuery = useGameHighlightsQuery(game.id, {
    enabled: displayMode === 'AUTOMATIC',
  });

  if (displayMode === 'CURATED') {
    return <CuratedMediaPlayer videos={query.data!.curatedVideos} />;
  }
  if (displayMode === 'AUTOMATIC') {
    return <GameHighlightsSection game={game} query={highlightsQuery} />;
  }
  return null;
};
