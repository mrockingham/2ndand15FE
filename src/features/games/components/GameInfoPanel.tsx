import { Stack, Typography } from '@mui/material';

import {
  formatGameDate,
  formatGameTime,
} from '@/features/games/utils/dateTime';
import type { Game } from '@/features/games/types';

const InfoRow = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 750, textAlign: 'right' }}>
      {value}
    </Typography>
  </Stack>
);

export const GameInfoPanel = ({ game }: { readonly game: Game }) => {
  const venue = [game.venue.name, game.venue.city].filter(Boolean).join(' · ');
  return (
    <Stack spacing={1.25}>
      <InfoRow label="Date" value={formatGameDate(game.startTime)} />
      <InfoRow label="Kickoff" value={formatGameTime(game.startTime)} />
      {venue === '' ? null : <InfoRow label="Venue" value={venue} />}
      {game.broadcastNetwork === null ? null : (
        <InfoRow label="Broadcast" value={game.broadcastNetwork} />
      )}
    </Stack>
  );
};
