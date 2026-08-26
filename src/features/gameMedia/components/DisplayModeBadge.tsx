import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

import { displayModeLabel } from '@/features/gameMedia/presentation';
import type { GameMediaDisplayMode } from '@/features/gameMedia/types';

const colorFor = (mode: GameMediaDisplayMode): ChipProps['color'] => {
  if (mode === 'CURATED') return 'success';
  if (mode === 'AUTOMATIC') return 'primary';
  return 'default';
};

export const DisplayModeBadge = ({
  displayMode,
}: {
  readonly displayMode: GameMediaDisplayMode;
}) => (
  <Chip
    label={displayModeLabel[displayMode]}
    color={colorFor(displayMode)}
    size="small"
    sx={{ fontWeight: 800 }}
  />
);
