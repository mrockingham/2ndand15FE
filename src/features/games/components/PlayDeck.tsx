import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useMemo } from 'react';

import {
  formatDownDistance,
  formatGameClock,
} from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

export type PlayDeckDirection = 'forward' | 'backward';

const WINDOW_SIZE = 4;
const STACK_OFFSET_X = 14;
const STACK_OFFSET_Y = 12;
const STACK_SCALE_STEP = 0.045;
const STACK_ROTATE_STEP = 1.5;
const CARD_HEIGHT = 132;

interface CardCustom {
  readonly index: number;
  readonly direction: PlayDeckDirection;
}

const cardVariants: Variants = {
  center: (custom: CardCustom) => ({
    x: custom.index * STACK_OFFSET_X,
    y: custom.index * STACK_OFFSET_Y,
    scale: 1 - custom.index * STACK_SCALE_STEP,
    opacity: Math.max(0.3, 1 - custom.index * 0.22),
    rotate: custom.index * STACK_ROTATE_STEP,
  }),
  enter: (custom: CardCustom) =>
    custom.direction === 'forward'
      ? {
          x: WINDOW_SIZE * STACK_OFFSET_X + 40,
          y: WINDOW_SIZE * STACK_OFFSET_Y + 40,
          scale: 0.6,
          opacity: 0,
          rotate: 10,
        }
      : { x: -100, y: -24, scale: 0.9, opacity: 0, rotate: -10 },
  exit: (custom: CardCustom) =>
    custom.direction === 'forward'
      ? { x: -120, y: -56, scale: 0.85, opacity: 0, rotate: -16 }
      : {
          x: WINDOW_SIZE * STACK_OFFSET_X + 56,
          y: WINDOW_SIZE * STACK_OFFSET_Y + 56,
          scale: 0.55,
          opacity: 0,
          rotate: 14,
        },
};

const categoryAccent = (play: GamePlay) => {
  if (play.flags.scoring) return 'success.main';
  if (play.flags.turnover) return 'error.main';
  if (play.flags.penalty) return 'warning.main';
  return 'primary.main';
};

const PlayDeckCard = ({ play }: { readonly play: GamePlay }) => {
  const clock = formatGameClock(play.clock) ?? 'Time unavailable';
  const downDistance = formatDownDistance(play.start.down, play.start.distance);

  return (
    <Card
      variant="outlined"
      data-testid="play-deck-card"
      data-play-id={play.id}
      sx={{
        height: '100%',
        p: 1.75,
        borderRadius: 2,
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: categoryAccent(play),
        bgcolor: 'background.paper',
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      <Stack spacing={0.5} sx={{ height: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Chip
            size="small"
            variant="outlined"
            label={play.type.replace('_', ' ')}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Q{play.period} · {clock}
          </Typography>
        </Stack>
        {downDistance === null ? null : (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {downDistance}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {play.description}
        </Typography>
      </Stack>
    </Card>
  );
};

/**
 * A "deck of cards" style history strip: the current play sits on top with
 * upcoming plays fanned out behind it. Navigating forward/backward through
 * PlaybackControls animates cards on/off the stack instead of just swapping
 * text, so the play description stays legible without needing to squint at
 * the 3D scene overlay.
 */
export const PlayDeck = ({
  plays,
  currentPlayId,
  direction,
  onSelectPlay,
  reduceMotion,
}: {
  readonly plays: readonly GamePlay[];
  readonly currentPlayId: string;
  readonly direction: PlayDeckDirection;
  readonly onSelectPlay: (playId: string) => void;
  readonly reduceMotion: boolean;
}) => {
  const sorted = useMemo(
    () => [...plays].sort((left, right) => left.sequence - right.sequence),
    [plays],
  );
  const currentIndex = sorted.findIndex((item) => item.id === currentPlayId);
  const visible =
    currentIndex === -1
      ? []
      : sorted.slice(currentIndex, currentIndex + WINDOW_SIZE);

  if (visible.length === 0) return null;

  return (
    <Box
      data-testid="play-deck"
      sx={{
        position: 'relative',
        height: CARD_HEIGHT + (WINDOW_SIZE - 1) * STACK_OFFSET_Y + 8,
      }}
    >
      <AnimatePresence initial={false}>
        {visible.map((item, index) => (
          <motion.div
            key={item.id}
            custom={{ index, direction } satisfies CardCustom}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 320, damping: 32 }
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: CARD_HEIGHT,
              zIndex: WINDOW_SIZE - index,
              cursor: index === 0 ? 'default' : 'pointer',
            }}
            onClick={index === 0 ? undefined : () => onSelectPlay(item.id)}
          >
            <PlayDeckCard play={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};
