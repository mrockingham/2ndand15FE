import { Box, Stack, Typography } from '@mui/material';

import { formatYardLine } from '@/features/games/presentation';
import type { GamePlay } from '@/features/games/types';

const Marker = ({
  percent,
  color,
}: {
  readonly percent: number;
  readonly color: string;
}) => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: `${percent}%`,
      width: 14,
      height: 14,
      borderRadius: '50%',
      bgcolor: color,
      border: '2px solid',
      borderColor: 'background.paper',
      transform: 'translate(-50%, -50%)',
      boxShadow: 1,
    }}
  />
);

export const FieldProgress = ({ play }: { readonly play: GamePlay | null }) => {
  if (play === null) {
    return (
      <Typography color="text.secondary">
        Select a play to see field position.
      </Typography>
    );
  }

  const startYard = play.start.yardLine;
  const endYard = play.end.yardLine;

  if (startYard === null && endYard === null) {
    return (
      <Typography color="text.secondary">
        Field position unavailable for this play.
      </Typography>
    );
  }

  const startPercent = startYard ?? endYard!;
  const endPercent = endYard ?? startYard!;
  const startLabel = startYard === null ? null : formatYardLine(startYard);
  const endLabel = endYard === null ? null : formatYardLine(endYard);
  const summary =
    startLabel !== null && endLabel !== null
      ? `${startLabel} → ${endLabel}`
      : (startLabel ?? endLabel);

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontWeight: 700 }}>{summary}</Typography>
      <Box
        aria-hidden="true"
        sx={{
          position: 'relative',
          height: 48,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'appSurfaces.borderStrong',
          background:
            'repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), rgba(128,128,128,0.25) calc(10% - 1px), rgba(128,128,128,0.25) 10%)',
        }}
      >
        <Marker percent={startPercent} color="text.secondary" />
        <Marker percent={endPercent} color="primary.main" />
      </Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          OWN
        </Typography>
        <Typography variant="caption" color="text.secondary">
          50
        </Typography>
        <Typography variant="caption" color="text.secondary">
          OPP
        </Typography>
      </Stack>
    </Stack>
  );
};
