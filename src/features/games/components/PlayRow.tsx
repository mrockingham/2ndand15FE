import { memo } from 'react';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { formatDownDistance } from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

export const PlayRow = memo(
  ({
    play,
    selected,
    onSelect,
  }: {
    readonly play: GamePlay;
    readonly selected: boolean;
    readonly onSelect: (playId: string) => void;
  }) => {
    const distance = formatDownDistance(play.start.down, play.start.distance);

    return (
      <Box
        component="button"
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(play.id)}
        sx={{
          all: 'unset',
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
          borderRadius: 1.5,
          px: 1.5,
          py: 1.25,
          border: '1px solid',
          borderColor: selected ? 'primary.main' : 'transparent',
          bgcolor: selected ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              Q{play.period} · {play.clock}
            </Typography>
            {play.possessionTeam === null ? null : (
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {play.possessionTeam.abbreviation}
              </Typography>
            )}
            {distance === null ? null : (
              <Typography variant="caption" color="text.secondary">
                {distance}
              </Typography>
            )}
            {play.flags.scoring ? (
              <Chip
                size="small"
                color="success"
                icon={<EmojiEventsRounded fontSize="small" />}
                label="SCORE"
                sx={{ fontWeight: 800 }}
              />
            ) : null}
            {play.flags.turnover ? (
              <Chip
                size="small"
                color="error"
                icon={<ReplayRounded fontSize="small" />}
                label="TURNOVER"
                sx={{ fontWeight: 800 }}
              />
            ) : null}
            {play.flags.penalty ? (
              <Chip
                size="small"
                color="warning"
                icon={<FlagRounded fontSize="small" />}
                label="FLAG"
                sx={{ fontWeight: 800 }}
              />
            ) : null}
          </Stack>
          <Typography sx={{ textAlign: 'left' }}>{play.description}</Typography>
        </Stack>
      </Box>
    );
  },
);

PlayRow.displayName = 'PlayRow';
