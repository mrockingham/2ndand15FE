import {
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { DataHealthStateChip } from '@/features/dataHealth/components/DataHealthStateChip';
import { PlayerStatsCell } from '@/features/dataHealth/components/PlayerStatsCell';
import {
  deriveRowSeverity,
  formatCheckedAgo,
} from '@/features/dataHealth/presentation';
import type { DataHealthGameRow } from '@/features/dataHealth/types';
import { formatAdminDateTime } from '@/features/admin/format';

const severityBorderColor: Readonly<
  Record<'high' | 'medium' | 'informational', string>
> = {
  high: 'error.main',
  medium: 'warning.main',
  informational: 'info.main',
};

const lastCheckLabel = (row: DataHealthGameRow) =>
  row.lastProbe === null
    ? 'Never checked'
    : formatCheckedAgo(row.lastProbe.checkedAt);

export const DataHealthGamesTable = ({
  rows,
  onReview,
}: {
  readonly rows: readonly DataHealthGameRow[];
  readonly onReview: (gameId: string) => void;
}) => (
  <>
    <TableContainer
      component={Card}
      variant="outlined"
      sx={{ display: { xs: 'none', lg: 'block' } }}
    >
      <Table aria-label="Game data health">
        <TableHead>
          <TableRow>
            <TableCell>Kickoff</TableCell>
            <TableCell>Matchup</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Team Stats</TableCell>
            <TableCell>Player Stats</TableCell>
            <TableCell>Plays</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Last Check</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const severity = deriveRowSeverity(row);
            return (
              <TableRow
                key={row.gameId}
                hover
                sx={{
                  borderLeft: severity === null ? undefined : 4,
                  borderLeftColor:
                    severity === null
                      ? undefined
                      : severityBorderColor[severity],
                }}
              >
                <TableCell>{formatAdminDateTime(row.kickoff)}</TableCell>
                <TableCell>
                  <strong>{row.awayTeam.abbreviation}</strong> at{' '}
                  <strong>{row.homeTeam.abbreviation}</strong>
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <DataHealthStateChip state={row.result.state} />
                </TableCell>
                <TableCell>
                  <DataHealthStateChip state={row.teamStats.state} />
                </TableCell>
                <TableCell>
                  <PlayerStatsCell row={row} />
                </TableCell>
                <TableCell>
                  <DataHealthStateChip state={row.plays.state} />
                </TableCell>
                <TableCell>
                  {row.providerMapping.available ? 'Mapped' : 'Not mapped'}
                </TableCell>
                <TableCell>{lastCheckLabel(row)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onReview(row.gameId)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>

    <Stack spacing={2} sx={{ display: { lg: 'none' } }}>
      {rows.map((row) => {
        const severity = deriveRowSeverity(row);
        return (
          <Card
            key={row.gameId}
            variant="outlined"
            sx={{
              borderLeft: severity === null ? undefined : 4,
              borderLeftColor:
                severity === null ? undefined : severityBorderColor[severity],
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {formatAdminDateTime(row.kickoff)}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {row.awayTeam.abbreviation} @ {row.homeTeam.abbreviation} ·{' '}
                {row.status}
              </Typography>
              <Stack spacing={1.25}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Result
                  </Typography>
                  <DataHealthStateChip state={row.result.state} />
                </Stack>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Team Stats
                  </Typography>
                  <DataHealthStateChip state={row.teamStats.state} />
                </Stack>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Player Stats
                  </Typography>
                  <PlayerStatsCell row={row} />
                </Stack>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Play-by-Play
                  </Typography>
                  <DataHealthStateChip state={row.plays.state} />
                </Stack>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography variant="body2">
                    {row.providerMapping.available ? 'Mapped' : 'Not mapped'}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => onReview(row.gameId)}
              >
                Review
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  </>
);
