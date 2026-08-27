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
import {
  formatGameDate,
  formatMetricValue,
  formatTeamContext,
} from '@/features/statsHub/presentation';
import type {
  SeasonLeader,
  StatsMetric,
  StatsView,
  WeeklyLeader,
} from '@/features/statsHub/types';

const PlayerLink = ({ row }: { readonly row: SeasonLeader | WeeklyLeader }) => (
  <Link
    component={RouterLink}
    to={`/players/${row.player.id}`}
    underline="hover"
  >
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <PlayerAvatar
        name={row.player.displayName}
        headshotUrl={row.player.headshotUrl}
        width={42}
      />
      <Typography sx={{ fontWeight: 800 }}>{row.player.displayName}</Typography>
    </Stack>
  </Link>
);

const Context = ({ row }: { readonly row: SeasonLeader | WeeklyLeader }) =>
  'teamContext' in row ? (
    <>{formatTeamContext(row.teamContext)}</>
  ) : (
    <>
      {row.team.abbreviation} vs {row.opponent.abbreviation}
    </>
  );

export const Leaderboard = ({
  view,
  rows,
  metric,
}: {
  readonly view: StatsView;
  readonly rows: readonly (SeasonLeader | WeeklyLeader)[];
  readonly metric: StatsMetric;
}) => (
  <>
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ display: { xs: 'none', md: 'block' } }}
    >
      <Table aria-label={`${metric.label} ${view} leaderboard`}>
        <caption>
          Backend-ranked {metric.label.toLowerCase()} leaders. Tied values share
          the same rank.
        </caption>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>
              {view === 'season' ? 'Team context' : 'Matchup'}
            </TableCell>
            {view === 'season' ? (
              <TableCell align="right">Games</TableCell>
            ) : (
              <>
                <TableCell>Week</TableCell>
                <TableCell>Date</TableCell>
              </>
            )}
            <TableCell align="right">{metric.shortLabel}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${'gameId' in row ? row.gameId : row.player.id}-${index}`}
              hover
            >
              <TableCell>
                <Typography
                  aria-label={`Rank ${row.rank}`}
                  sx={{ fontWeight: 900 }}
                >
                  {row.rank}
                  {row.tied ? ' (tie)' : ''}
                </Typography>
              </TableCell>
              <TableCell>
                <PlayerLink row={row} />
              </TableCell>
              <TableCell>{row.player.position ?? '—'}</TableCell>
              <TableCell>
                {'gameId' in row ? (
                  <Link
                    component={RouterLink}
                    to={`/games/${row.gameId}`}
                    underline="hover"
                  >
                    <Context row={row} />
                  </Link>
                ) : (
                  <Context row={row} />
                )}
              </TableCell>
              {'teamContext' in row ? (
                <TableCell align="right">{row.games}</TableCell>
              ) : (
                <>
                  <TableCell>{row.week}</TableCell>
                  <TableCell>{formatGameDate(row.gameDate)}</TableCell>
                </>
              )}
              <TableCell align="right">
                <Typography
                  variant="h6"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatMetricValue(row.metricValue, metric)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Box
      aria-label={`${metric.label} ${view} leaderboard cards`}
      sx={{ display: { xs: 'grid', md: 'none' }, gap: 1.5 }}
    >
      {rows.map((row, index) => (
        <Card
          key={`${'gameId' in row ? row.gameId : row.player.id}-${index}`}
          variant="outlined"
        >
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ minWidth: 48, textAlign: 'center' }}>
                <Typography variant="overline">Rank</Typography>
                <Typography variant="h4">{row.rank}</Typography>
                {row.tied ? (
                  <Typography variant="caption">Tied</Typography>
                ) : null}
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <PlayerLink row={row} />
                <Typography variant="body2" color="text.secondary">
                  {row.player.position ?? 'Position unavailable'} ·{' '}
                  <Context row={row} />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {'teamContext' in row
                    ? `${row.games} recorded games`
                    : `Week ${row.week} · ${formatGameDate(row.gameDate)}`}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="overline">{metric.shortLabel}</Typography>
                <Typography
                  variant="h4"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatMetricValue(row.metricValue, metric)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  </>
);
