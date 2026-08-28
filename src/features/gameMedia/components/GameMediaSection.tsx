import { Stack, Typography } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';

import { GameMediaPlayer } from '@/features/gameMedia/components/GameMediaPlayer';
import type { GameMediaResult } from '@/features/gameMedia/types';
import { getGameHighlightsDisplayState } from '@/features/games/presentation';
import type { Game } from '@/features/games/types';

export const GameMediaSection = ({
  game,
  query,
  compact = false,
}: {
  readonly game: Game;
  readonly query: UseQueryResult<GameMediaResult, unknown>;
  readonly compact?: boolean;
}) => {
  const displayVideos = query.data?.displayVideos ?? [];

  // Backend `displayVideos` is the single authoritative playlist -- curated,
  // automatic, and global media are never recombined or reordered here.
  // `key={game.id}` forces a remount (and thus a selection reset) whenever
  // the viewer navigates to a different game.
  if (displayVideos.length > 0) {
    return (
      <GameMediaPlayer
        key={game.id}
        game={game}
        videos={displayVideos}
        compact={compact}
      />
    );
  }

  // No selectable video -- fall back to the same "checking/unavailable"
  // messaging the automatic-highlight-only section used pre-M32C, driven by
  // the same coverage/highlights fields now carried on the unified payload
  // (GameMediaResult structurally satisfies GameHighlightsResult).
  const state = getGameHighlightsDisplayState(
    game.status,
    query.data,
    query.isError,
  );
  if (state !== 'checking' && state !== 'unavailable') return null;

  return (
    <Stack
      spacing={1.5}
      component="section"
      aria-labelledby="game-media-heading"
    >
      <Typography id="game-media-heading" component="h2" variant="h6">
        Highlights
      </Typography>
      {state === 'checking' ? (
        <Typography color="text.secondary">
          Highlights are being checked.
        </Typography>
      ) : null}
      {state === 'unavailable' ? (
        <Typography color="text.secondary">
          Highlights are temporarily unavailable.
        </Typography>
      ) : null}
    </Stack>
  );
};
