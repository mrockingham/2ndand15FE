import LeaderboardRounded from '@mui/icons-material/LeaderboardRounded';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PlayerAttribution } from '@/features/players/components/PlayerAttribution';
import { Leaderboard } from '@/features/statsHub/components/Leaderboard';
import { RecentPerformanceExplorer } from '@/features/statsHub/components/RecentPerformanceExplorer';
import { getStatsErrorMessage } from '@/features/statsHub/errors';
import { formatSeasonType } from '@/features/statsHub/presentation';
import {
  useLeaderboardQuery,
  useStatsMetadataQuery,
} from '@/features/statsHub/queries';
import { statsHubKeys } from '@/features/statsHub/queryKeys';
import type {
  NormalizedStatsUrlState,
  StatsSeasonType,
} from '@/features/statsHub/types';
import {
  normalizeStatsUrlState,
  serializeStatsUrlState,
  updateStatsUrlState,
} from '@/features/statsHub/urlState';
import { useTeamsQuery } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import { ApiError } from '@/services/api/apiClient';

export const StatsPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const metadataQuery = useStatsMetadataQuery();
  const queryClient = useQueryClient();
  const teamsQuery = useTeamsQuery();
  const favorite = useCurrentUserQuery().data?.favoriteTeam ?? null;
  const metadata = metadataQuery.data?.metadata;
  const state = useMemo(
    () => (metadata ? normalizeStatsUrlState(parameters, metadata) : null),
    [metadata, parameters],
  );

  useEffect(() => {
    if (!state) return;
    const normalized = serializeStatsUrlState(state);
    if (normalized.toString() !== parameters.toString()) {
      setParameters(normalized, { replace: true });
    }
  }, [parameters, setParameters, state]);

  useEffect(() => {
    if (!state?.teamId || !teamsQuery.data) return;
    if (!teamsQuery.data.some((team) => team.id === state.teamId)) {
      const next = serializeStatsUrlState({ ...state, teamId: undefined });
      setParameters(next, { replace: true });
    }
  }, [setParameters, state, teamsQuery.data]);

  const leaderboardFilters = state
    ? {
        season: state.season,
        seasonType: state.seasonType,
        metric: state.metric,
        week: state.week,
        teamId: state.teamId,
        position: state.position,
        positionGroup: state.positionGroup,
        limit: metadata?.limits.leaderboards.default ?? 25,
      }
    : null;
  const teamFilterReady =
    !state?.teamId ||
    teamsQuery.isError ||
    teamsQuery.data?.some((team) => team.id === state.teamId) === true;
  const leaderboardQuery = useLeaderboardQuery(
    state?.view ?? 'season',
    leaderboardFilters ?? {
      season: 0,
      seasonType: 'REG',
      metric: '',
      limit: 1,
    },
    state !== null && teamFilterReady,
  );

  if (metadataQuery.isPending) {
    return (
      <Container maxWidth="xl" sx={{ py: 7 }}>
        <Typography component="h1" variant="h2">
          Stats
        </Typography>
        <Typography role="status">Loading Stats Hub options…</Typography>
      </Container>
    );
  }

  if (metadataQuery.isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 7 }}>
        <Typography component="h1" variant="h2" sx={{ mb: 3 }}>
          Stats
        </Typography>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => void metadataQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          Stats Hub options are unavailable.{' '}
          {getStatsErrorMessage(metadataQuery.error)}
        </Alert>
      </Container>
    );
  }

  if (!metadata || !state) {
    return (
      <Container maxWidth="xl" sx={{ py: 7 }}>
        <Typography component="h1" variant="h2">
          Stats
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          No imported statistical seasons or supported metrics are available
          yet.
        </Alert>
      </Container>
    );
  }

  const metric = metadata.metrics.find(
    (candidate) => candidate.id === state.metric,
  )!;
  const metrics = metadata.metrics.filter(
    (candidate) =>
      candidate.category === state.category &&
      (state.view === 'season'
        ? candidate.availableForSeasonLeaders
        : candidate.availableForWeekLeaders),
  );
  const categories = metadata.categories.filter((category) =>
    metadata.metrics.some(
      (candidate) =>
        candidate.category === category.id &&
        (state.view === 'season'
          ? candidate.availableForSeasonLeaders
          : candidate.availableForWeekLeaders),
    ),
  );
  const seasonTypes =
    state.view === 'season'
      ? metadata.seasonTypes.seasonLeaders
      : metadata.seasonTypes.weeklyLeaders;
  const rows = leaderboardQuery.data?.pages.flatMap((page) => page.rows) ?? [];

  const change = (changes: Partial<NormalizedStatsUrlState>) => {
    const next = updateStatsUrlState(state, metadata, changes);
    if (next) setParameters(serializeStatsUrlState(next));
  };

  const changeView = (view: 'season' | 'week') =>
    change({
      view,
      week: view === 'week' ? (state.week ?? 1) : undefined,
      seasonType:
        view === 'week' && state.seasonType === 'REG_POST'
          ? 'REG'
          : state.seasonType,
    });

  const changeCategory = (category: string) => {
    const nextMetric = metadata.metrics.find(
      (candidate) =>
        candidate.category === category &&
        (state.view === 'season'
          ? candidate.availableForSeasonLeaders
          : candidate.availableForWeekLeaders),
    );
    if (nextMetric) change({ category, metric: nextMetric.id });
  };

  const retryLeaderboard = () => {
    if (
      leaderboardQuery.error instanceof ApiError &&
      leaderboardQuery.error.code === 'STATS_INVALID_CURSOR' &&
      leaderboardFilters
    ) {
      const queryKey =
        state.view === 'season'
          ? statsHubKeys.season(leaderboardFilters)
          : statsHubKeys.weekly(leaderboardFilters);
      return queryClient.resetQueries({ queryKey, exact: true });
    }
    return leaderboardQuery.refetch();
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
              NFLVERSE HISTORICAL DATA
            </Typography>
            <Typography component="h1" variant="h2">
              Stats
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              Explore historical NFL player leaderboards across the imported{' '}
              {Math.min(...metadata.availableSeasons)}–
              {Math.max(...metadata.availableSeasons)} dataset. Live 2026 player
              statistics are not included yet.
            </Typography>
          </Box>
          <Chip
            icon={<LeaderboardRounded />}
            label={`Stats API ${metadata.apiVersion}`}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Tabs
              value={state.view}
              onChange={(_event, value: 'season' | 'week') => changeView(value)}
              aria-label="Leaderboard view"
            >
              <Tab value="season" label="Season leaders" />
              <Tab value="week" label="Weekly leaders" />
            </Tabs>

            <Box>
              <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
                Category
              </Typography>
              <Tabs
                value={state.category}
                onChange={(_event, value: string) => changeCategory(value)}
                aria-label="Stat category"
                variant="scrollable"
                scrollButtons="auto"
              >
                {categories.map((category) => (
                  <Tab
                    key={category.id}
                    value={category.id}
                    label={category.label}
                  />
                ))}
              </Tabs>
            </Box>

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
                label="Metric"
                value={state.metric}
                onChange={(event) => change({ metric: event.target.value })}
              >
                {metrics.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Season"
                value={state.season}
                onChange={(event) =>
                  change({ season: Number(event.target.value) })
                }
              >
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
                label="Season type"
                value={state.seasonType}
                onChange={(event) =>
                  change({ seasonType: event.target.value as StatsSeasonType })
                }
              >
                {seasonTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatSeasonType(type)}
                  </MenuItem>
                ))}
              </TextField>
              {state.view === 'week' ? (
                <TextField
                  select
                  label="Week"
                  value={state.week}
                  onChange={(event) =>
                    change({ week: Number(event.target.value) })
                  }
                >
                  {Array.from({ length: 22 }, (_value, index) => index + 1).map(
                    (week) => (
                      <MenuItem key={week} value={week}>
                        Week {week}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              ) : null}
              <TextField
                select
                label="Team"
                value={
                  teamsQuery.data?.some((team) => team.id === state.teamId)
                    ? state.teamId
                    : ''
                }
                onChange={(event) =>
                  change({ teamId: event.target.value || undefined })
                }
              >
                <MenuItem value="">All Teams</MenuItem>
                {teamsQuery.data?.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.abbreviation} — {team.fullName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Position"
                value={state.position ?? ''}
                onChange={(event) =>
                  change({ position: event.target.value || undefined })
                }
              >
                <MenuItem value="">All Positions</MenuItem>
                {metadata.positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Position group"
                value={state.positionGroup ?? ''}
                onChange={(event) =>
                  change({ positionGroup: event.target.value || undefined })
                }
              >
                <MenuItem value="">All Position Groups</MenuItem>
                {metadata.positionGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {favorite ? (
              <Button
                variant={
                  state.teamId === favorite.id ? 'contained' : 'outlined'
                }
                onClick={() =>
                  change({
                    teamId:
                      state.teamId === favorite.id ? undefined : favorite.id,
                  })
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                {state.teamId === favorite.id ? 'Showing' : 'Show'} My Team:{' '}
                {favorite.abbreviation}
              </Button>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              Position filters use the value stored on each historical stat
              record. Team-filtered season rankings count only production
              recorded for that team, including a traded player’s team split.
            </Typography>
          </Stack>
        </Paper>

        <Box component="section" aria-labelledby="leaderboard-title">
          <Stack spacing={2}>
            <Box>
              <Typography id="leaderboard-title" component="h2" variant="h3">
                {metric.label} leaders
              </Typography>
              <Typography id="metric-description" color="text.secondary">
                {metric.description}
              </Typography>
              <Box component="details" sx={{ mt: 1 }}>
                <Typography
                  component="summary"
                  sx={{ cursor: 'pointer', fontWeight: 700 }}
                >
                  How rankings work
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  The backend uses competition ranking: equal values share a
                  rank, so a tie can produce
                  {` ${metadata.ranking.tieExample.join(', ')}.`} Global ranks
                  remain unchanged across pages.
                </Typography>
              </Box>
            </Box>

            {leaderboardQuery.isPending ? (
              <Typography role="status">Loading leaderboard…</Typography>
            ) : null}
            {leaderboardQuery.isError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    onClick={() => void retryLeaderboard()}
                  >
                    {leaderboardQuery.error instanceof ApiError &&
                    leaderboardQuery.error.code === 'STATS_INVALID_CURSOR'
                      ? 'Start over'
                      : 'Retry'}
                  </Button>
                }
              >
                {getStatsErrorMessage(leaderboardQuery.error)}
              </Alert>
            ) : null}
            {!leaderboardQuery.isPending &&
            !leaderboardQuery.isError &&
            rows.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5">
                  {state.view === 'week'
                    ? `No recorded leaders for week ${state.week}`
                    : 'No season leaders found'}
                </Typography>
                <Typography color="text.secondary">
                  Try another metric, season, or filter.
                </Typography>
              </Paper>
            ) : null}
            {rows.length ? (
              <Leaderboard view={state.view} rows={rows} metric={metric} />
            ) : null}
            {leaderboardQuery.hasNextPage ? (
              <Button
                variant="outlined"
                disabled={leaderboardQuery.isFetchingNextPage}
                onClick={() => void leaderboardQuery.fetchNextPage()}
                sx={{ alignSelf: 'center' }}
              >
                {leaderboardQuery.isFetchingNextPage
                  ? 'Loading…'
                  : 'Load more leaders'}
              </Button>
            ) : null}
          </Stack>
        </Box>

        <RecentPerformanceExplorer
          state={state}
          metadata={metadata}
          metric={metric}
          onChange={change}
        />

        <Paper component="aside" variant="outlined" sx={{ p: 2.5 }}>
          <Typography component="h2" variant="h5">
            Coverage and source notes
          </Typography>
          <Box component="ul" sx={{ my: 1.5, pl: 2.5 }}>
            {metadata.coverageNotes.map((note) => (
              <li key={note}>
                <Typography>{note}</Typography>
              </li>
            ))}
          </Box>
          <PlayerAttribution attribution={metadataQuery.data.attribution} />
        </Paper>
      </Stack>
    </Container>
  );
};
