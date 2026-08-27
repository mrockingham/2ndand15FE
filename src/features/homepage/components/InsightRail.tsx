import {
  Alert,
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { formatProbability } from '@/features/aiHub/presentation';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import {
  insightPickMatchupLabel,
  weeklyLeaderAccessibleLabel,
  weeklyLeaderMetricLabel,
} from '@/features/homepage/presentation';
import type {
  HomepageAiHubSnapshot,
  HomepageInsightPick,
  HomepageWeeklyLeader,
  HomepageWeeklyLeaders,
} from '@/features/homepage/types';

interface HomepageQueryState {
  readonly data?: {
    readonly insights: {
      readonly aiHub: HomepageAiHubSnapshot | null;
      readonly weeklyLeaders: HomepageWeeklyLeaders | null;
    };
  };
  readonly isError: boolean;
  readonly isPending: boolean;
}

const InsightRow = ({
  label,
  matchup,
  value,
}: {
  readonly label: string;
  readonly matchup: string;
  readonly value: string;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
    >
      <Typography sx={{ fontWeight: 800 }}>{matchup}</Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Stack>
  </Box>
);

const pickValue = (pick: HomepageInsightPick) =>
  formatProbability(pick.favoriteProbability);

const AiHubSnapshotCard = ({
  aiHub,
  isPending,
  isError,
}: {
  readonly aiHub: HomepageAiHubSnapshot | null | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
}) => (
  <Stack spacing={2}>
    <HomeSectionHeader
      eyebrow="BASELINE MODEL"
      title="AI Hub snapshot"
      actionLabel="View AI Hub"
      actionTo="/ai"
    />
    <Card sx={{ p: { xs: 2.25, md: 2.75 }, minHeight: 230 }}>
      {isPending ? (
        <Stack
          spacing={1.5}
          aria-busy="true"
          aria-label="Loading AI Hub snapshot"
        >
          {Array.from({ length: 3 }, (_value, index) => (
            <Skeleton key={index} variant="rounded" height={48} />
          ))}
        </Stack>
      ) : isError ? (
        <Alert severity="info">
          AI Hub insights are temporarily unavailable. Other Home sections still
          work.
        </Alert>
      ) : !aiHub ? (
        <Alert severity="info">
          No published weekly insights are available.
        </Alert>
      ) : (
        <Stack spacing={1.75} divider={<Divider flexItem />}>
          {aiHub.strongestPick ? (
            <InsightRow
              label="Strongest pick"
              matchup={insightPickMatchupLabel(aiHub.strongestPick)}
              value={pickValue(aiHub.strongestPick)}
            />
          ) : null}
          {aiHub.closestMatchup ? (
            <InsightRow
              label="Closest matchup"
              matchup={insightPickMatchupLabel(aiHub.closestMatchup)}
              value={pickValue(aiHub.closestMatchup)}
            />
          ) : null}
          {aiHub.highestProjectedTotal ? (
            <InsightRow
              label="Highest projected total"
              matchup={insightPickMatchupLabel(aiHub.highestProjectedTotal)}
              value={
                aiHub.highestProjectedTotal.projectedTotal === null
                  ? '—'
                  : `${String(aiHub.highestProjectedTotal.projectedTotal)} points`
              }
            />
          ) : null}
          {!aiHub.strongestPick &&
          !aiHub.closestMatchup &&
          !aiHub.highestProjectedTotal ? (
            <Alert severity="info">
              No published weekly insights are available.
            </Alert>
          ) : null}
        </Stack>
      )}
    </Card>
  </Stack>
);

const WeeklyLeaderRow = ({
  category,
  leader,
}: {
  readonly category: 'passing' | 'rushing' | 'receiving';
  readonly leader: HomepageWeeklyLeader;
}) => {
  const categoryLabel =
    category === 'passing'
      ? 'Passing'
      : category === 'rushing'
        ? 'Rushing'
        : 'Receiving';
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase' }}
      >
        {categoryLabel}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{leader.playerName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {leader.team}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {leader.value.toLocaleString('en-US')} YDS
        </Typography>
      </Stack>
      <Typography
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {weeklyLeaderAccessibleLabel(
          leader,
          `${categoryLabel} (${weeklyLeaderMetricLabel[leader.metric] ?? leader.metric})`,
        )}
      </Typography>
    </Box>
  );
};

const WeeklyLeadersCard = ({
  weeklyLeaders,
}: {
  readonly weeklyLeaders: HomepageWeeklyLeaders;
}) => {
  const categories: readonly (readonly [
    'passing' | 'rushing' | 'receiving',
    HomepageWeeklyLeader | null,
  ])[] = [
    ['passing', weeklyLeaders.passing],
    ['rushing', weeklyLeaders.rushing],
    ['receiving', weeklyLeaders.receiving],
  ];
  const populated = categories.filter(
    (entry): entry is [(typeof entry)[0], HomepageWeeklyLeader] =>
      entry[1] !== null,
  );
  if (populated.length === 0) return null;

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        Week {weeklyLeaders.week} Leaders
      </Typography>
      <Card sx={{ p: { xs: 2.25, md: 2.75 } }}>
        <Stack spacing={1.75} divider={<Divider flexItem />}>
          {populated.map(([category, leader]) => (
            <WeeklyLeaderRow
              key={category}
              category={category}
              leader={leader}
            />
          ))}
        </Stack>
      </Card>
    </Stack>
  );
};

export const InsightRail = ({
  homepageQuery,
}: {
  readonly homepageQuery: HomepageQueryState;
}) => {
  const insights = homepageQuery.data?.insights;
  return (
    <Stack spacing={4} sx={{ alignSelf: 'start' }}>
      <AiHubSnapshotCard
        aiHub={insights?.aiHub}
        isPending={homepageQuery.isPending}
        isError={homepageQuery.isError}
      />
      {!homepageQuery.isPending &&
      !homepageQuery.isError &&
      insights?.weeklyLeaders ? (
        <WeeklyLeadersCard weeklyLeaders={insights.weeklyLeaders} />
      ) : null}
    </Stack>
  );
};
