import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

import {
  formatAdminDateTime,
  gameStatusLabel,
  seasonTypeLabel,
} from '@/features/admin/format';
import type { AdminGameValues } from '@/features/admin/types';

const Entry = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography>{value}</Typography>
  </Box>
);

export const GameValuesPanel = ({
  title,
  values,
  emphasized = false,
}: {
  readonly title: string;
  readonly values: AdminGameValues;
  readonly emphasized?: boolean;
}) => (
  <Paper
    variant="outlined"
    sx={{ p: 2.5, borderColor: emphasized ? 'primary.main' : 'divider' }}
  >
    <Typography variant="h5">{title}</Typography>
    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
      {emphasized
        ? 'Values currently returned by the public API.'
        : 'Underlying normalized schedule values before editorial fallback.'}
    </Typography>
    <Divider sx={{ my: 2 }} />
    <Stack spacing={1.5}>
      <Entry
        label="Matchup"
        value={`${values.awayTeam.fullName} at ${values.homeTeam.fullName}`}
      />
      <Entry label="Kickoff" value={formatAdminDateTime(values.startTime)} />
      <Entry
        label="Season"
        value={`${String(values.season)} · ${seasonTypeLabel[values.seasonType]} · Week ${values.week ?? '—'}`}
      />
      <Entry label="Status" value={gameStatusLabel[values.status]} />
      <Entry
        label="Venue"
        value={`${values.venue.name ?? 'TBD'}${values.venue.city ? `, ${values.venue.city}` : ''}`}
      />
      <Entry label="Broadcast" value={values.broadcastNetwork ?? 'TBD'} />
      <Entry label="Neutral site" value={values.isNeutralSite ? 'Yes' : 'No'} />
    </Stack>
  </Paper>
);
