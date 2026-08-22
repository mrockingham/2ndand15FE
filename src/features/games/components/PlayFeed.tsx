import { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';

import { PlayRow } from '@/features/games/components/PlayRow';
import type { GamePlay } from '@/features/games/types';

export const PlayFeed = ({
  plays,
  selectedPlayId,
  onSelectPlay,
}: {
  readonly plays: readonly GamePlay[];
  readonly selectedPlayId: string | null;
  readonly onSelectPlay: (playId: string) => void;
}) => {
  const newestFirst = useMemo(
    () => [...plays].sort((left, right) => right.sequence - left.sequence),
    [plays],
  );

  if (plays.length === 0) {
    return (
      <Typography color="text.secondary">
        Play-by-play will appear once it is available for this game.
      </Typography>
    );
  }

  return (
    <Stack
      spacing={0.5}
      role="list"
      aria-label="Play-by-play, newest first"
      sx={{ maxHeight: { xs: 'none', md: 640 }, overflowY: { md: 'auto' } }}
    >
      {newestFirst.map((play) => (
        <div role="listitem" key={play.id}>
          <PlayRow
            play={play}
            selected={play.id === selectedPlayId}
            onSelect={onSelectPlay}
          />
        </div>
      ))}
    </Stack>
  );
};
