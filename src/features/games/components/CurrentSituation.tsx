import { Stack, Typography } from '@mui/material';

import {
  formatDownDistance,
  formatYardLine,
} from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

export const CurrentSituation = ({
  play,
}: {
  readonly play: GamePlay | null;
}) => {
  if (play === null) return null;

  const yardLine = play.end.yardLine ?? play.start.yardLine;
  const down = play.end.down ?? play.start.down;
  const distance = play.end.distance ?? play.start.distance;
  const distanceLabel = formatDownDistance(down, distance);

  return (
    <Stack spacing={0.25} sx={{ textAlign: 'center' }}>
      {play.possessionTeam === null ? null : (
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {play.possessionTeam.abbreviation} BALL
        </Typography>
      )}
      {yardLine === null ? null : (
        <Typography color="text.secondary">
          {formatYardLine(yardLine)}
        </Typography>
      )}
      {distanceLabel === null ? null : (
        <Typography variant="body2" color="text.secondary">
          {distanceLabel}
        </Typography>
      )}
    </Stack>
  );
};
