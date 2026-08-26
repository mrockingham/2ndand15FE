import { Box, Stack, Typography } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import { GameHighlightCard } from '@/features/games/components/GameHighlightCard';
import { getGameHighlightsDisplayState } from '@/features/games/presentation';
import type { Game, GameHighlightsResult } from '@/features/games/types';

export const GameHighlightsSection = ({
  game,
  query,
}: {
  readonly game: Game;
  readonly query: UseQueryResult<GameHighlightsResult, unknown>;
}) => {
  // One highlight plays at a time: starting another simply reassigns this id,
  // which unmounts the previous GameHighlightPlayer.
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null,
  );
  const state = getGameHighlightsDisplayState(
    game.status,
    query.data,
    query.isError,
  );
  if (state === 'hidden') return null;
  const highlights = query.data?.highlights ?? [];

  return (
    <Stack
      spacing={1.5}
      component="section"
      aria-labelledby="game-highlights-heading"
    >
      <Typography id="game-highlights-heading" component="h2" variant="h6">
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
      {state === 'cards' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(260px, 1fr))',
            },
          }}
        >
          {highlights.map((highlight) => (
            <GameHighlightCard
              key={highlight.id}
              highlight={highlight}
              awayTeam={game.awayTeam}
              homeTeam={game.homeTeam}
              isPlaying={highlight.id === activeHighlightId}
              onPlay={() => setActiveHighlightId(highlight.id)}
            />
          ))}
        </Box>
      ) : null}
    </Stack>
  );
};
