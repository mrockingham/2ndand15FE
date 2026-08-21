import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';

import { Leaderboard } from '@/features/statsHub/components/Leaderboard';
import { getStatsErrorMessage } from '@/features/statsHub/errors';
import { formatSeasonType } from '@/features/statsHub/presentation';
import { useStatsMetadataQuery } from '@/features/statsHub/queries';
import { getTeamHubErrorMessage } from '@/features/teamHub/errors';
import { useTeamLeadersQuery } from '@/features/teamHub/queries';
import { teamHubKeys } from '@/features/teamHub/queryKeys';
import type {
  NormalizedTeamHubUrlState,
  TeamHubOverview,
} from '@/features/teamHub/types';
import { ApiError } from '@/services/api/apiClient';

type LeaderState = NonNullable<NormalizedTeamHubUrlState['leader']>;

export const TeamLeadersSection = ({
  teamId,
  teamName,
  overview,
  state,
  onChange,
}: {
  readonly teamId: string;
  readonly teamName: string;
  readonly overview: TeamHubOverview;
  readonly state: NormalizedTeamHubUrlState;
  readonly onChange: (changes: Partial<LeaderState>) => void;
}) => {
  const queryClient = useQueryClient();
  const metadataQuery = useStatsMetadataQuery(true);
  const metadata = metadataQuery.data?.metadata;
  const leader = state.leader;
  const filters = {
    season: leader?.season ?? 0,
    seasonType: leader?.seasonType ?? 'REG',
    metric: leader?.metric ?? '',
    position: leader?.position,
    positionGroup: leader?.positionGroup,
    limit: metadata?.limits.leaderboards.default ?? 25,
  } as const;
  const query = useTeamLeadersQuery(
    teamId,
    filters,
    leader !== undefined && metadata !== undefined,
  );
  const rows = query.data?.pages.flatMap((page) => page.rows) ?? [];
  const metric = metadata?.metrics.find(
    (candidate) => candidate.id === leader?.metric,
  );
  const categories = metadata?.categories.filter((category) =>
    metadata.metrics.some(
      (candidate) =>
        candidate.category === category.id &&
        candidate.availableForSeasonLeaders,
    ),
  );
  const metrics = metadata?.metrics.filter(
    (candidate) =>
      candidate.category === leader?.category &&
      candidate.availableForSeasonLeaders,
  );

  const retry = () => {
    if (
      query.error instanceof ApiError &&
      query.error.code === 'STATS_INVALID_CURSOR'
    )
      return queryClient.resetQueries({
        queryKey: teamHubKeys.leader(teamId, filters),
        exact: true,
      });
    return query.refetch();
  };

  const changeCategory = (category: string) => {
    const nextMetric = metadata?.metrics.find(
      (candidate) =>
        candidate.category === category && candidate.availableForSeasonLeaders,
    );
    if (nextMetric) onChange({ category, metric: nextMetric.id });
  };

  const statsLink = leader
    ? `/stats?${new URLSearchParams({
        view: 'season',
        teamId,
        season: String(leader.season),
        type: leader.seasonType,
        category: leader.category,
        metric: leader.metric,
        ...(leader.position ? { position: leader.position } : {}),
        ...(leader.positionGroup
          ? { positionGroup: leader.positionGroup }
          : {}),
      }).toString()}`
    : '/stats';

  return (
    <Box component="section" id="leaders" aria-labelledby="team-leaders-title">
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography id="team-leaders-title" component="h2" variant="h3">
              Team statistical leaders
            </Typography>
            <Typography color="text.secondary">
              Totals include only production recorded for {teamName}. A traded
              player’s league-wide full-season total is not substituted.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={statsLink}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          >
            Open in full Stats Hub
          </Button>
        </Stack>

        {overview.historicalData.statSeasons.length === 0 ? (
          <Alert severity="info">
            No historical statistical seasons are available for this team.
          </Alert>
        ) : metadataQuery.isPending ? (
          <Paper sx={{ minHeight: 180, p: 3 }} aria-busy="true">
            <Typography role="status">Loading team leader options…</Typography>
          </Paper>
        ) : metadataQuery.isError ? (
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
            Team leader options are unavailable.{' '}
            {getStatsErrorMessage(metadataQuery.error)}
          </Alert>
        ) : !leader || !metadata || !metric ? (
          <Alert severity="info">
            No compatible historical leader metrics are available for this team.
          </Alert>
        ) : (
          <>
            <Tabs
              value={leader.category}
              onChange={(_event, value: string) => changeCategory(value)}
              aria-label="Team leader category"
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories?.map((category) => (
                <Tab
                  key={category.id}
                  value={category.id}
                  label={category.label}
                />
              ))}
            </Tabs>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
              }}
            >
              <TextField
                select
                label="Leader metric"
                value={leader.metric}
                onChange={(event) => onChange({ metric: event.target.value })}
              >
                {metrics?.map((candidate) => (
                  <MenuItem key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Leader season"
                value={leader.season}
                onChange={(event) =>
                  onChange({ season: Number(event.target.value) })
                }
              >
                {overview.historicalData.statSeasons
                  .filter((season) =>
                    metadata.availableSeasons.includes(season),
                  )
                  .map((season) => (
                    <MenuItem key={season} value={season}>
                      {season}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                label="Leader season type"
                value={leader.seasonType}
                onChange={(event) =>
                  onChange({
                    seasonType: event.target.value as LeaderState['seasonType'],
                  })
                }
              >
                {metadata.seasonTypes.seasonLeaders.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatSeasonType(type)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Leader position"
                value={leader.position ?? ''}
                onChange={(event) =>
                  onChange({ position: event.target.value || undefined })
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
                label="Leader position group"
                value={leader.positionGroup ?? ''}
                onChange={(event) =>
                  onChange({ positionGroup: event.target.value || undefined })
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
            <Typography color="text.secondary">{metric.description}</Typography>
            <Box component="details">
              <Typography
                component="summary"
                sx={{ cursor: 'pointer', fontWeight: 700 }}
              >
                Ranking and team-split semantics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Backend competition ranks are displayed directly; tied values
                share a rank. Recorded zero remains eligible and null values are
                excluded.
              </Typography>
            </Box>
            {query.isPending ? (
              <Paper
                variant="outlined"
                aria-busy="true"
                aria-label="Loading team leaders"
                sx={{ p: 3 }}
              >
                <Typography role="status">Loading team leaders…</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {Array.from({ length: 4 }, (_value, index) => (
                    <Skeleton key={index} variant="rounded" height={34} />
                  ))}
                </Stack>
              </Paper>
            ) : null}
            {query.isError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={() => void retry()}>
                    {query.error instanceof ApiError &&
                    query.error.code === 'STATS_INVALID_CURSOR'
                      ? 'Start over'
                      : 'Retry'}
                  </Button>
                }
              >
                {getTeamHubErrorMessage(query.error)}
              </Alert>
            ) : null}
            {!query.isPending && !query.isError && rows.length === 0 ? (
              <Alert severity="info">
                No team leader values exist for this metric and filters.
              </Alert>
            ) : null}
            {rows.length ? (
              <Leaderboard view="season" rows={rows} metric={metric} />
            ) : null}
            {query.hasNextPage ? (
              <Button
                variant="outlined"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
                sx={{ alignSelf: 'center' }}
              >
                {query.isFetchingNextPage
                  ? 'Loading…'
                  : 'Load more team leaders'}
              </Button>
            ) : null}
          </>
        )}
        <Link component={RouterLink} to="/stats">
          Browse league-wide historical Stats
        </Link>
      </Stack>
    </Box>
  );
};
