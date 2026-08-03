import { Chip } from '@mui/material';

import { gameStatusLabel } from '@/features/games/presentation';
import type { GameStatus } from '@/features/games/types';

const statusColor: Readonly<
  Record<GameStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'>
> = {
  SCHEDULED: 'default',
  PREGAME: 'primary',
  IN_PROGRESS: 'error',
  HALFTIME: 'warning',
  FINAL: 'success',
  POSTPONED: 'warning',
  CANCELED: 'error',
  SUSPENDED: 'warning',
};

export const GameStatusChip = ({ status }: { readonly status: GameStatus }) => (
  <Chip
    label={gameStatusLabel[status]}
    color={statusColor[status]}
    size="small"
    variant={status === 'SCHEDULED' ? 'outlined' : 'filled'}
    sx={{ fontWeight: 800 }}
  />
);
