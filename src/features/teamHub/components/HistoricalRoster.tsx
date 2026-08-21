import {
  Box,
  Card,
  CardContent,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { TeamRosterRow } from '@/features/teamHub/types';

const PlayerLink = ({ row }: { readonly row: TeamRosterRow }) => (
  <Link
    component={RouterLink}
    to={`/players/${row.player.id}`}
    underline="hover"
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <PlayerAvatar
        name={row.player.displayName}
        headshotUrl={row.player.headshotUrl}
        width={42}
      />
      <Typography sx={{ fontWeight: 800 }}>{row.player.displayName}</Typography>
    </Stack>
  </Link>
);

const unavailable = (value: string | number | null) => value ?? '—';

export const HistoricalRoster = ({
  rows,
  season,
}: {
  readonly rows: readonly TeamRosterRow[];
  readonly season: number;
}) => (
  <>
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ display: { xs: 'none', md: 'block' } }}
    >
      <Table aria-label={`${season} historical roster`}>
        <caption>
          Historical weekly-roster evidence for {season}. Latest known team is
          separate from historical membership.
        </caption>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Historical position</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Jersey</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Recorded weeks</TableCell>
            <TableCell align="right">Roster weeks</TableCell>
            <TableCell>Latest known team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.player.id}-${index}`} hover>
              <TableCell>
                <PlayerLink row={row} />
              </TableCell>
              <TableCell>{unavailable(row.position)}</TableCell>
              <TableCell>{unavailable(row.positionGroup)}</TableCell>
              <TableCell>
                {row.jerseyNumber === null ? '—' : `#${row.jerseyNumber}`}
              </TableCell>
              <TableCell>{unavailable(row.status)}</TableCell>
              <TableCell>
                Week {row.firstWeek}–{row.lastWeek}
              </TableCell>
              <TableCell align="right">{row.rosterWeekCount}</TableCell>
              <TableCell>{row.latestKnownTeam?.abbreviation ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ display: { xs: 'grid', md: 'none' }, gap: 1.25 }}>
      {rows.map((row, index) => (
        <Card key={`${row.player.id}-${index}`} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <PlayerLink row={row} />
              <Typography>
                Historical position: {unavailable(row.position)} ·{' '}
                {unavailable(row.positionGroup)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.historicalTeam.abbreviation} roster evidence: weeks{' '}
                {row.firstWeek}–{row.lastWeek}
                {' · '}
                {row.rosterWeekCount} recorded roster weeks
              </Typography>
              <Typography variant="body2">
                Latest known team:{' '}
                {row.latestKnownTeam?.fullName ?? 'Unavailable'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Jersey:{' '}
                {row.jerseyNumber === null
                  ? 'Unavailable'
                  : `#${row.jerseyNumber}`}
                {' · '}Historical status: {row.status ?? 'Unavailable'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  </>
);
