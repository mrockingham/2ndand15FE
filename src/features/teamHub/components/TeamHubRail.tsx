import GroupsRounded from '@mui/icons-material/GroupsRounded';
import {
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { HomeFavoriteMatchup } from '@/features/home/components/HomeGamesPanels';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { formatLeaderValue } from '@/features/homepage/presentation';
import { useTeamLeadersQuery } from '@/features/teamHub/queries';
import type {
  NormalizedTeamHubUrlState,
  TeamHubOverview,
  TeamLeaderFilters,
} from '@/features/teamHub/types';
import type { StatsMetadata } from '@/features/statsHub/types';

const GLANCE_CATEGORY_LABELS = ['passing', 'rushing', 'receiving'] as const;
const DUMMY_FILTERS: TeamLeaderFilters = {
  season: 0,
  seasonType: 'REG',
  metric: '',
  limit: 1,
};

type LeaderState = NormalizedTeamHubUrlState['leader'];

const glanceCategories = (metadata: StatsMetadata) =>
  GLANCE_CATEGORY_LABELS.map((label) =>
    metadata.categories.find(
      (candidate) => candidate.label.toLowerCase() === label,
    ),
  );

const buildGlanceFilters = (
  category: StatsMetadata['categories'][number] | undefined,
  metadata: StatsMetadata | undefined,
  leader: LeaderState,
): TeamLeaderFilters | null => {
  if (!category || !metadata || !leader) return null;
  const metric = metadata.metrics.find(
    (candidate) =>
      candidate.category === category.id && candidate.availableForSeasonLeaders,
  );
  if (!metric) return null;
  return {
    season: leader.season,
    seasonType: leader.seasonType,
    metric: metric.id,
    limit: 1,
  };
};

/** Compact "top leader per category" summary reusing the existing team
 * leaders endpoint at limit=1 -- three bounded requests (not one per row),
 * which also warms the cache the full Team Leaders table below reads from
 * when a visitor opens the matching category tab. */
const TeamAtAGlanceCard = ({
  teamId,
  overview,
  metadata,
  leader,
}: {
  readonly teamId: string;
  readonly overview: TeamHubOverview;
  readonly metadata: StatsMetadata | undefined;
  readonly leader: LeaderState;
}) => {
  const categories = metadata ? glanceCategories(metadata) : [];
  const filtersList = [0, 1, 2].map((index) =>
    buildGlanceFilters(categories[index], metadata, leader),
  );
  const queries = [
    useTeamLeadersQuery(
      teamId,
      filtersList[0] ?? DUMMY_FILTERS,
      filtersList[0] !== null,
    ),
    useTeamLeadersQuery(
      teamId,
      filtersList[1] ?? DUMMY_FILTERS,
      filtersList[1] !== null,
    ),
    useTeamLeadersQuery(
      teamId,
      filtersList[2] ?? DUMMY_FILTERS,
      filtersList[2] !== null,
    ),
  ];

  if (overview.historicalData.statSeasons.length === 0 || !leader) return null;

  const isPending = filtersList.some(
    (filters, index) => filters !== null && queries[index]!.isPending,
  );
  const rows = queries.map(
    (query) => query.data?.pages.flatMap((page) => page.rows)[0],
  );
  const populated = categories
    .map((category, index) => ({ category, row: rows[index] }))
    .filter(
      (
        entry,
      ): entry is {
        category: NonNullable<typeof entry.category>;
        row: NonNullable<typeof entry.row>;
      } => entry.category !== undefined && entry.row !== undefined,
    );

  if (!isPending && populated.length === 0) return null;

  return (
    <Stack spacing={2}>
      <HomeSectionHeader
        eyebrow={`${String(leader.season)} SEASON · HISTORICAL`}
        title="Team at a glance"
        actionLabel="Open Stat Leaders"
        actionTo="#leaders"
      />
      <Card sx={{ p: { xs: 2.25, md: 2.75 } }}>
        {isPending ? (
          <Stack
            spacing={1.5}
            aria-busy="true"
            aria-label="Loading team at a glance"
          >
            {Array.from({ length: 3 }, (_value, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={1.75} divider={<Divider flexItem />}>
            {populated.map(({ category, row }) => (
              <Box key={category.id}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase' }}
                >
                  {category.label}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {row.player.displayName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatLeaderValue(row.metricValue)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
};

const ExploreLeagueCard = () => (
  <Card component="section" sx={{ p: { xs: 2.5, md: 3 } }}>
    <Stack spacing={1.5}>
      <GroupsRounded color="primary" aria-hidden="true" />
      <Typography component="h2" variant="h3">
        Explore the league
      </Typography>
      <Typography color="text.secondary">
        Browse every team hub for schedules, published news, and clearly labeled
        historical coverage.
      </Typography>
      <Button component={RouterLink} to="/teams" variant="outlined">
        Explore Teams
      </Button>
      <Typography variant="caption" color="text.secondary">
        Current 2026 standings are not available, so no record or division table
        is inferred.
      </Typography>
    </Stack>
  </Card>
);

/** Right-column rail for Team Hub: next/last game, a compact historical
 * "at a glance" leader summary, and Explore the League. Every module is
 * optional -- when none apply, TeamHubPage widens its adaptive grid ratio
 * instead of reserving empty rail space. */
export const TeamHubRail = ({
  teamId,
  overview,
  metadata,
  leader,
}: {
  readonly teamId: string;
  readonly overview: TeamHubOverview;
  readonly metadata: StatsMetadata | undefined;
  readonly leader: LeaderState;
}) => {
  const hasGame =
    overview.schedule.upcoming.length > 0 ||
    overview.schedule.recent.length > 0;

  return (
    <Stack spacing={4} sx={{ alignSelf: 'start' }}>
      {hasGame ? (
        <HomeFavoriteMatchup
          favoriteTeam={overview.team}
          recent={overview.schedule.recent}
          upcoming={overview.schedule.upcoming}
        />
      ) : null}
      <TeamAtAGlanceCard
        teamId={teamId}
        overview={overview}
        metadata={metadata}
        leader={leader}
      />
      <ExploreLeagueCard />
    </Stack>
  );
};
