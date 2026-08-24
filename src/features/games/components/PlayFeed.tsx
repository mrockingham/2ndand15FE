import { useMemo, useRef, useState, type UIEvent } from 'react';
import { Button, Stack, Typography } from '@mui/material';

import { PlayRow } from '@/features/games/components/PlayRow';
import { countNewPlaysSince } from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

const NEAR_TOP_THRESHOLD_PX = 32;

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearTop, setIsNearTop] = useState(true);
  const [lastSeenSequence, setLastSeenSequence] = useState(
    () => newestFirst[0]?.sequence ?? 0,
  );

  // When a fresh newest-first order arrives while the user is at the top,
  // silently advance the "seen" baseline instead of surfacing a banner.
  const [previousNewestFirst, setPreviousNewestFirst] = useState(newestFirst);
  if (newestFirst !== previousNewestFirst) {
    setPreviousNewestFirst(newestFirst);
    if (isNearTop) {
      setLastSeenSequence(newestFirst[0]?.sequence ?? lastSeenSequence);
    }
  }

  const newPlaysCount = isNearTop
    ? 0
    : countNewPlaysSince(newestFirst, lastSeenSequence);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsNearTop(event.currentTarget.scrollTop <= NEAR_TOP_THRESHOLD_PX);
  };

  const handleShowNewPlays = () => {
    setLastSeenSequence(newestFirst[0]?.sequence ?? lastSeenSequence);
    setIsNearTop(true);
    containerRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  if (plays.length === 0) {
    return (
      <Typography color="text.secondary">
        Play-by-play will appear once it is available for this game.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {newPlaysCount > 0 ? (
        <Button
          size="small"
          variant="outlined"
          onClick={handleShowNewPlays}
          sx={{ alignSelf: 'center' }}
        >
          {newPlaysCount} new play{newPlaysCount === 1 ? '' : 's'}
        </Button>
      ) : null}
      <Stack
        ref={containerRef}
        onScroll={handleScroll}
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
    </Stack>
  );
};
