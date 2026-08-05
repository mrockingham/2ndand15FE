import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

import { visibleGameMetrics } from '@/features/players/metrics';
import {
  formatGameDate,
  formatStatValue,
  seasonTypeLabel,
} from '@/features/players/presentation';
import type { PlayerGameStat } from '@/features/players/types';

export const PlayerGameLog = ({
  stats,
}: {
  readonly stats: readonly PlayerGameStat[];
}) => {
  const metrics = visibleGameMetrics(stats);
  if (stats.length === 0)
    return (
      <Typography color="text.secondary">
        No recorded appearances match this season selection. Missing weeks and
        byes are not synthesized.
      </Typography>
    );
  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        tabIndex={0}
        sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: '100%' }}
      >
        <Table size="small" aria-label="Player game log">
          <caption>
            Recorded appearances only; an em dash means the statistic was
            unavailable.
          </caption>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                }}
              >
                Game
              </TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Opponent</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric.key} align="right" title={metric.label}>
                  {metric.shortLabel}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Button
                    component={RouterLink}
                    to={`/games/${stat.gameId}`}
                    size="small"
                  >
                    {seasonTypeLabel[stat.seasonType]} · Wk {stat.week}
                  </Button>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {formatGameDate(stat.startTime)}
                  </Typography>
                </TableCell>
                <TableCell>{stat.team.abbreviation}</TableCell>
                <TableCell>{stat.opponent.abbreviation}</TableCell>
                {metrics.map((metric) => (
                  <TableCell
                    key={metric.key}
                    align="right"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatStatValue(metric.value(stat))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack spacing={1.5} sx={{ display: { lg: 'none' } }}>
        {stats.map((stat) => (
          <Card key={stat.id} variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <Button
                    component={RouterLink}
                    to={`/games/${stat.gameId}`}
                    sx={{ px: 0 }}
                  >
                    {seasonTypeLabel[stat.seasonType]} · Week {stat.week}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {formatGameDate(stat.startTime)} · {stat.team.abbreviation}{' '}
                    vs {stat.opponent.abbreviation}
                  </Typography>
                </div>
                <Chip size="small" label={stat.position ?? 'Position N/A'} />
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1.5,
                  mt: 2,
                }}
              >
                {metrics.slice(0, 6).map((metric) => (
                  <div key={metric.key}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}>
                      {formatStatValue(metric.value(stat))}
                    </Typography>
                  </div>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
};
