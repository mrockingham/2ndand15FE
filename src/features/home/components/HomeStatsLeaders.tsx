import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { formatMetricValue } from '@/features/statsHub/presentation';
import {
  useLeaderboardQuery,
  useStatsMetadataQuery,
} from '@/features/statsHub/queries';
import { useTeamLeadersQuery } from '@/features/teamHub/queries';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';

export const HomeStatsLeaders = ({
  preferredSeason,
  teamId,
  teamName,
}: {
  readonly preferredSeason?: number | null;
  readonly teamId?: string;
  readonly teamName?: string;
}) => {
  const metadataQuery = useStatsMetadataQuery(true);
  const metadata = metadataQuery.data?.metadata;
  const availableSeasons = metadata?.availableSeasons ?? [];
  const season =
    preferredSeason !== null &&
    preferredSeason !== undefined &&
    availableSeasons.includes(preferredSeason)
      ? preferredSeason
      : [...availableSeasons].sort((left, right) => right - left)[0];
  const metric = metadata?.metrics.find(
    (candidate) => candidate.availableForSeasonLeaders,
  );
  const seasonType = metadata?.seasonTypes.seasonLeaders.includes('REG')
    ? ('REG' as const)
    : metadata?.seasonTypes.seasonLeaders[0];
  const filters = {
    season: season ?? 0,
    seasonType: seasonType ?? ('REG' as const),
    metric: metric?.id ?? '',
    limit: 3,
  };
  const ready =
    metadata !== undefined &&
    season !== undefined &&
    seasonType !== undefined &&
    metric !== undefined;
  const leagueQuery = useLeaderboardQuery(
    'season',
    filters,
    ready && teamId === undefined,
  );
  const teamQuery = useTeamLeadersQuery(
    teamId ?? '',
    filters,
    ready && teamId !== undefined,
  );
  const activeQuery = teamId === undefined ? leagueQuery : teamQuery;
  const rows = activeQuery.data?.pages.flatMap((page) => page.rows) ?? [];
  const statsParameters = ready
    ? new URLSearchParams({
        view: 'season',
        season: String(season),
        type: seasonType,
        category: metric.category,
        metric: metric.id,
        ...(teamId ? { teamId } : {}),
      })
    : null;

  return (
    <Stack component="section" spacing={2} aria-labelledby="home-stats-heading">
      <HomeSectionHeader
        eyebrow="IMPORTED HISTORICAL DATA"
        title={
          season === undefined
            ? 'Stats leaders'
            : `${season} ${teamName ? 'Team ' : ''}Leaders`
        }
        actionLabel="View all stats"
        actionTo={
          statsParameters ? `/stats?${statsParameters.toString()}` : '/stats'
        }
      />
      <Card sx={{ p: { xs: 2.25, md: 2.75 }, minHeight: 240 }}>
        {metadataQuery.isPending ? (
          <Stack
            spacing={1.5}
            aria-busy="true"
            aria-label="Loading stats leaders"
          >
            {Array.from({ length: 3 }, (_value, index) => (
              <Skeleton key={index} variant="rounded" height={54} />
            ))}
          </Stack>
        ) : metadataQuery.isError ? (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                onClick={() => void metadataQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            Historical Stats options are temporarily unavailable.
          </Alert>
        ) : !ready ? (
          <Alert severity="info">
            No compatible historical leader data is available.
          </Alert>
        ) : activeQuery.isPending ? (
          <Stack
            spacing={1.5}
            aria-busy="true"
            aria-label="Loading stats leaders"
          >
            {Array.from({ length: 3 }, (_value, index) => (
              <Skeleton key={index} variant="rounded" height={54} />
            ))}
          </Stack>
        ) : activeQuery.isError ? (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                onClick={() => void activeQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            Historical leaders are temporarily unavailable. Other Home sections
            remain ready.
          </Alert>
        ) : rows.length === 0 ? (
          <Alert severity="info">
            No {metric.label.toLowerCase()} values are available for these
            historical filters.
          </Alert>
        ) : (
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            <Typography variant="caption" color="text.secondary">
              {metric.label} · backend competition ranks and team-split totals
            </Typography>
            {rows.map((row) => (
              <Stack
                key={`${row.player.id}-${row.rank}`}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Typography sx={{ minWidth: 24, fontWeight: 900 }}>
                  {row.rank}
                </Typography>
                <PlayerAvatar
                  name={row.player.displayName}
                  headshotUrl={row.player.headshotUrl}
                  width={42}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {row.player.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.player.position ?? 'Position unavailable'} ·{' '}
                    {row.games} recorded games
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    {metric.shortLabel}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMetricValue(row.metricValue, metric)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          Historical imported coverage only. This is not a current 2026 roster
          or preseason leaderboard.
        </Typography>
      </Card>
    </Stack>
  );
};
