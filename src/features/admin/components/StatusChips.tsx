import { Chip, Stack } from '@mui/material';

import type { AdminGame } from '@/features/admin/types';

export const StatusChips = ({ game }: { readonly game: AdminGame }) => (
  <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
    <Chip size="small" label={game.resolved.status.replaceAll('_', ' ')} />
    {game.override ? (
      <Chip size="small" color="warning" label="Overridden" />
    ) : null}
    <Chip
      size="small"
      variant={game.provenance?.verifiedAt ? 'filled' : 'outlined'}
      color={game.provenance?.verifiedAt ? 'success' : 'default'}
      label={game.provenance?.verifiedAt ? 'Verified' : 'Unverified'}
    />
    {game.providerManaged ? (
      <Chip size="small" variant="outlined" label="Provider managed" />
    ) : null}
  </Stack>
);
