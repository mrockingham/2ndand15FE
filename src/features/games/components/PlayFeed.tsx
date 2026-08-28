import { useMemo, useRef, useState, type UIEvent } from 'react';
import { Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';

import { PlayRow } from '@/features/games/components/PlayRow';
import { countNewPlaysSince } from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

const NEAR_TOP_THRESHOLD_PX = 32;
const periodLabel = (period: number) =>
  period <= 4
    ? `${['1st', '2nd', '3rd', '4th'][period - 1]} Quarter`
    : `OT${period - 4}`;

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
  const [feed, setFeed] = useState<'all' | 'scoring'>('all');
  const visible =
    feed === 'scoring'
      ? newestFirst.filter((play) => play.flags.scoring)
      : newestFirst;
  const grouped = useMemo(() => {
    const result = new Map<number, GamePlay[]>();
    for (const play of visible)
      result.set(play.period, [...(result.get(play.period) ?? []), play]);
    return [...result.entries()].sort(([left], [right]) => right - left);
  }, [visible]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearTop, setIsNearTop] = useState(true);
  const [lastSeenSequence, setLastSeenSequence] = useState(
    () => newestFirst[0]?.sequence ?? 0,
  );
  const [previousNewestFirst, setPreviousNewestFirst] = useState(newestFirst);
  if (newestFirst !== previousNewestFirst) {
    setPreviousNewestFirst(newestFirst);
    if (isNearTop)
      setLastSeenSequence(newestFirst[0]?.sequence ?? lastSeenSequence);
  }
  const newPlaysCount = isNearTop
    ? 0
    : countNewPlaysSince(newestFirst, lastSeenSequence);
  const handleScroll = (event: UIEvent<HTMLDivElement>) =>
    setIsNearTop(event.currentTarget.scrollTop <= NEAR_TOP_THRESHOLD_PX);
  const handleShowNewPlays = () => {
    setLastSeenSequence(newestFirst[0]?.sequence ?? lastSeenSequence);
    setIsNearTop(true);
    containerRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  if (plays.length === 0)
    return (
      <Typography color="text.secondary">
        Play-by-play will appear once it is available for this game.
      </Typography>
    );
  return (
    <Stack spacing={1}>
      <Tabs
        value={feed}
        onChange={(_event, value: 'all' | 'scoring') => setFeed(value)}
        aria-label="Play feed views"
        variant="fullWidth"
      >
        <Tab value="all" label="Play-by-Play" />
        <Tab value="scoring" label="Scoring Plays" />
      </Tabs>
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
        role="list"
        aria-label={
          feed === 'all'
            ? 'Play-by-play, newest first'
            : 'Scoring plays, newest first'
        }
        sx={{
          maxHeight: { xs: 'none', lg: 760 },
          overflowY: { lg: 'auto' },
          pr: { lg: 0.5 },
        }}
      >
        {grouped.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No scoring plays are available.
          </Typography>
        ) : null}
        {grouped.map(([period, periodPlays]) => (
          <Stack key={period} spacing={0.25}>
            <Typography
              component="h3"
              variant="overline"
              color="text.secondary"
              sx={{
                position: 'sticky',
                top: 0,
                bgcolor: 'background.paper',
                zIndex: 1,
                py: 1,
              }}
            >
              {periodLabel(period)}
            </Typography>
            <Divider />
            {periodPlays.map((play) => (
              <div role="listitem" key={play.id}>
                <PlayRow
                  play={play}
                  selected={play.id === selectedPlayId}
                  onSelect={onSelectPlay}
                />
              </div>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
