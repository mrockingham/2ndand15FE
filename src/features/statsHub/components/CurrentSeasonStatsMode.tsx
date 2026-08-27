import BarChartRounded from '@mui/icons-material/BarChartRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { seasonTypeLabel } from '@/features/games/presentation';
import { useTeamsQuery } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useCurrentGameStatsQuery } from '../queries';
import {
  readCurrentStatsFilters,
  serializeCurrentStatsState,
} from '../currentUrlState';
import type { CurrentStatsFilters } from '../currentTypes';
import { statsHubKeys } from '../queryKeys';
import { CurrentGameStatsCard } from './CurrentGameStatsCard';
import { StatsModeTabs } from './StatsModeTabs';

const CurrentStatsSkeleton = () => (
  <Box
    role="status"
    aria-label="Loading current-season game statistics"
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
    }}
  >
    {[0, 1, 2, 3].map((item) => (
      <Skeleton key={item} variant="rounded" height={420} />
    ))}
  </Box>
);

export const CurrentSeasonStatsMode = () => {
  const [parameters, setParameters] = useSearchParams();
  const queryClient = useQueryClient();
  const teamsQuery = useTeamsQuery();
  const favorite = useCurrentUserQuery().data?.favoriteTeam ?? null;
  const filters = readCurrentStatsFilters(parameters);
  const teamFilterReady =
    filters.teamId === undefined ||
    teamsQuery.isError ||
    teamsQuery.data?.some((team) => team.id === filters.teamId) === true;
  const query = useCurrentGameStatsQuery(filters, teamFilterReady);
  const result = query.data;

  useEffect(() => {
    if (filters.teamId === undefined || !teamsQuery.data) return;
    if (!teamsQuery.data.some((team) => team.id === filters.teamId)) {
      const next = new URLSearchParams(parameters);
      next.delete('teamId');
      setParameters(next, { replace: true });
    }
  }, [filters.teamId, parameters, setParameters, teamsQuery.data]);

  useEffect(() => {
    if (!result) return;
    const normalized = serializeCurrentStatsState(result, filters.teamId);
    if (normalized.toString() !== parameters.toString()) {
      queryClient.setQueryData(
        statsHubKeys.current(readCurrentStatsFilters(normalized)),
        result,
      );
      setParameters(normalized, { replace: true });
    }
  }, [filters.teamId, parameters, queryClient, result, setParameters]);

  const change = (changes: CurrentStatsFilters) => {
    if (!result) return;
    const teamId = Object.hasOwn(changes, 'teamId')
      ? changes.teamId
      : filters.teamId;
    setParameters(
      serializeCurrentStatsState(
        {
          season: changes.season ?? result.season,
          seasonType: changes.seasonType ?? result.seasonType,
          week: changes.week ?? result.week,
        },
        teamId,
      ),
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="overline" color="primary.light">
              GAME-BASED TEAM STATISTICS
            </Typography>
            <Typography component="h1" variant="h2">
              Stats
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              Compare current-season team production game by game. Historical
              player leaderboards remain available separately.
            </Typography>
          </Box>
          <Chip
            icon={<BarChartRounded />}
            label="Current season"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>

        <StatsModeTabs mode="current" />

        {query.isPending ? <CurrentStatsSkeleton /> : null}
        {query.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
          >
            Current-season game statistics are temporarily unavailable.
            Historical Stats remains available.
          </Alert>
        ) : null}

        {result ? (
          <>
            <Box>
              <Typography component="h2" variant="h3">
                {result.season} NFL Stats
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {seasonTypeLabel[result.seasonType]}
                {result.week === 'ALL'
                  ? ' · All available games'
                  : ` · Week ${result.week}`}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {result.coverageNote}
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                }}
              >
                <TextField
                  select
                  label="Season"
                  value={result.season}
                  onChange={(event) =>
                    change({ season: Number(event.target.value) })
                  }
                >
                  {result.availableSeasons.map((season) => (
                    <MenuItem key={season} value={season}>
                      {season}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Season type"
                  value={result.seasonType}
                  onChange={(event) =>
                    change({
                      seasonType: event.target
                        .value as typeof result.seasonType,
                    })
                  }
                >
                  {result.availableSeasonTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {seasonTypeLabel[type]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Week"
                  value={result.week}
                  onChange={(event) =>
                    change({
                      week:
                        event.target.value === 'ALL'
                          ? 'ALL'
                          : Number(event.target.value),
                      teamId: filters.teamId,
                    })
                  }
                >
                  <MenuItem value="ALL">All Available Games</MenuItem>
                  {result.availableWeeks.map((week) => (
                    <MenuItem key={week} value={week}>
                      Week {week}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Team"
                  value={filters.teamId ?? ''}
                  onChange={(event) =>
                    change({
                      week: result.week,
                      teamId: event.target.value || undefined,
                    })
                  }
                >
                  <MenuItem value="">All Teams</MenuItem>
                  {teamsQuery.data?.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.abbreviation} — {team.fullName}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {favorite ? (
                <Button
                  variant={
                    filters.teamId === favorite.id ? 'contained' : 'outlined'
                  }
                  onClick={() =>
                    change({
                      week: result.week,
                      teamId:
                        filters.teamId === favorite.id
                          ? undefined
                          : favorite.id,
                    })
                  }
                  sx={{ mt: 2 }}
                >
                  {filters.teamId === favorite.id ? 'Showing' : 'Show'} My Team:{' '}
                  {favorite.abbreviation}
                </Button>
              ) : null}
            </Paper>

            <Box
              component="section"
              aria-labelledby="current-game-comparisons-title"
            >
              <Typography
                id="current-game-comparisons-title"
                component="h2"
                variant="overline"
              >
                Game stat comparisons
              </Typography>
              {result.games.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ mt: 2, p: 4, textAlign: 'center' }}
                >
                  <Typography variant="h5">
                    No games match these filters
                  </Typography>
                  <Typography color="text.secondary">
                    Choose another available week or team.
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    mt: 2,
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      lg: 'repeat(2, minmax(0, 1fr))',
                    },
                  }}
                >
                  {result.games.map((entry) => (
                    <CurrentGameStatsCard key={entry.game.id} entry={entry} />
                  ))}
                </Box>
              )}
            </Box>

            <Alert severity="info" variant="outlined">
              League-wide current-season rankings will appear when statistical
              coverage is complete enough for fair comparisons.
            </Alert>
          </>
        ) : null}
      </Stack>
    </Container>
  );
};
