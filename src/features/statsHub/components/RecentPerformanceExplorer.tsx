import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PlayerSearchPicker } from '@/features/players/components/PlayerSearchPicker';
import { getStatsErrorMessage } from '@/features/statsHub/errors';
import {
  formatGameDate,
  formatMetricValue,
  formatSeasonType,
} from '@/features/statsHub/presentation';
import { useRecentPerformanceQuery } from '@/features/statsHub/queries';
import type {
  NormalizedStatsUrlState,
  StatsMetadata,
  StatsMetric,
} from '@/features/statsHub/types';
import { usePlayerQuery } from '@/features/players/queries';

export const RecentPerformanceExplorer = ({
  state,
  metadata,
  metric,
  onChange,
}: {
  readonly state: NormalizedStatsUrlState;
  readonly metadata: StatsMetadata;
  readonly metric: StatsMetric;
  readonly onChange: (changes: Partial<NormalizedStatsUrlState>) => void;
}) => {
  const selectedPlayerQuery = usePlayerQuery(state.recentPlayerId ?? '');
  const canUseMetric = metric.availableForRecentPerformance;
  const recentQuery = useRecentPerformanceQuery(
    state.recentPlayerId && canUseMetric
      ? {
          playerId: state.recentPlayerId,
          metric: metric.id,
          season: state.recentSeason,
          seasonType: state.recentSeasonType,
          games: state.recentGames,
        }
      : null,
  );
  const result = recentQuery.data;
  const gameCounts = [5, 10, 20].filter(
    (count) => count <= metadata.limits.recentGames.maximum,
  );

  return (
    <Box component="section" aria-labelledby="recent-performance-title">
      <Stack spacing={2.5}>
        <Box>
          <Typography id="recent-performance-title" component="h2" variant="h3">
            Recent recorded performances
          </Typography>
          <Typography color="text.secondary">
            Inspect chronological appearances for {metric.label}. Byes, DNPs,
            and scheduled games are not synthesized.
          </Typography>
        </Box>

        <PlayerSearchPicker
          label="Find a player"
          selected={selectedPlayerQuery.data?.player ?? null}
          onSelect={(player) => onChange({ recentPlayerId: player?.id })}
        />

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          <TextField
            select
            label="Recent season"
            value={state.recentSeason ?? ''}
            onChange={(event) =>
              onChange({
                recentSeason: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          >
            <MenuItem value="">All imported seasons</MenuItem>
            {[...metadata.availableSeasons]
              .sort((a, b) => b - a)
              .map((season) => (
                <MenuItem key={season} value={season}>
                  {season}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Recent season type"
            value={state.recentSeasonType ?? ''}
            onChange={(event) =>
              onChange({
                recentSeasonType: event.target.value
                  ? (event.target.value as 'REG' | 'POST')
                  : undefined,
              })
            }
          >
            <MenuItem value="">Regular and postseason</MenuItem>
            {metadata.seasonTypes.recentPerformance.map((type) => (
              <MenuItem key={type} value={type}>
                {formatSeasonType(type)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Appearances"
            value={state.recentGames}
            onChange={(event) =>
              onChange({ recentGames: Number(event.target.value) })
            }
          >
            {gameCounts.map((count) => (
              <MenuItem key={count} value={count}>
                {count}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {!state.recentPlayerId ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5">Choose a player</Typography>
            <Typography color="text.secondary">
              Search by name to view recent recorded appearances.
            </Typography>
          </Paper>
        ) : null}
        {!canUseMetric ? (
          <Alert severity="info">
            {metric.label} is not available for recent performance.
          </Alert>
        ) : null}
        {state.recentPlayerId && selectedPlayerQuery.isPending ? (
          <Typography role="status">Loading selected player…</Typography>
        ) : null}
        {recentQuery.isPending && state.recentPlayerId && canUseMetric ? (
          <Typography role="status">Loading recent performances…</Typography>
        ) : null}
        {recentQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => void recentQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            {getStatsErrorMessage(recentQuery.error)}
          </Alert>
        ) : null}

        {result ? (
          <>
            <Box
              aria-label="Recent performance summary"
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
              }}
            >
              {[
                ['Appearances', result.summary.gamesRepresented],
                ['Known values', result.summary.valuesRepresented],
                ['Missing values', result.summary.missingDataCount],
                ['Average', formatMetricValue(result.summary.average, metric)],
                ['Total', formatMetricValue(result.summary.total, metric)],
                ['Minimum', formatMetricValue(result.summary.minimum, metric)],
                ['Maximum', formatMetricValue(result.summary.maximum, metric)],
              ].map(([label, value]) => (
                <Paper key={label} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5">{value}</Typography>
                </Paper>
              ))}
            </Box>
            {result.performances.length === 0 ? (
              <Alert severity="info">
                This player has no recorded appearances for the selected
                filters.
              </Alert>
            ) : result.summary.valuesRepresented === 0 ? (
              <Alert severity="info">
                These appearances are recorded, but {metric.label.toLowerCase()}{' '}
                is unavailable.
              </Alert>
            ) : null}
            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: { md: 'repeat(2, 1fr)' },
              }}
            >
              {result.performances.map((performance, index) => (
                <Card
                  key={`${performance.gameId}-${performance.team.id}-${index}`}
                  variant="outlined"
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between', gap: 2 }}
                    >
                      <Box>
                        <Typography variant="overline">
                          {performance.season} · Week {performance.week}
                        </Typography>
                        <Typography variant="h6">
                          {performance.team.abbreviation} vs{' '}
                          {performance.opponent.abbreviation}
                        </Typography>
                        <Link
                          component={RouterLink}
                          to={`/games/${performance.gameId}`}
                        >
                          {formatGameDate(performance.gameDate)}
                        </Link>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="overline">
                          {metric.shortLabel}
                        </Typography>
                        <Typography variant="h4">
                          {formatMetricValue(performance.value, metric)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        ) : null}
      </Stack>
    </Box>
  );
};
