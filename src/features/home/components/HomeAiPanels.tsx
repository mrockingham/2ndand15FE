import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  formatBrierScore,
  formatNullableRate,
  formatProbability,
  matchupLabel,
  projectedScoreForTeam,
} from '@/features/aiHub/presentation';
import type {
  FavoriteTeamPrediction,
  WeeklyInsights,
} from '@/features/aiHub/types';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';

interface QueryState {
  readonly data?: WeeklyInsights;
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly refetch: () => Promise<unknown>;
}

const AiError = ({ retry }: { readonly retry: () => Promise<unknown> }) => (
  <Alert
    severity="info"
    action={
      <Button color="inherit" onClick={() => void retry()}>
        Retry
      </Button>
    }
  >
    AI Hub insights are temporarily unavailable. Other Home sections still work.
  </Alert>
);

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

export const HomeAiSnapshot = ({ query }: { readonly query: QueryState }) => {
  const insights = query.data;
  return (
    <Stack spacing={2}>
      <HomeSectionHeader
        eyebrow="BASELINE MODEL"
        title="AI Hub snapshot"
        actionLabel="View AI Hub"
        actionTo="/ai"
      />
      <Card sx={{ p: { xs: 2.25, md: 2.75 }, minHeight: 230 }}>
        {query.isPending ? (
          <Stack
            spacing={1.5}
            aria-busy="true"
            aria-label="Loading AI Hub snapshot"
          >
            {Array.from({ length: 3 }, (_value, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        ) : query.isError ? (
          <AiError retry={query.refetch} />
        ) : !insights || insights.context.predictionCount === 0 ? (
          <Alert severity="info">
            No published weekly insights are available.
          </Alert>
        ) : (
          <Stack spacing={1.75} divider={<Divider flexItem />}>
            {insights.strongestPick ? (
              <InsightRow
                label="Strongest pick"
                matchup={`${insights.strongestPick.favorite.abbreviation} over ${insights.strongestPick.underdog.abbreviation}`}
                value={`${formatProbability(insights.strongestPick.favoriteProbability)} · ${insights.strongestPick.confidence}`}
              />
            ) : null}
            {insights.closestMatchup ? (
              <InsightRow
                label="Closest matchup"
                matchup={matchupLabel(insights.closestMatchup)}
                value={`${formatProbability(insights.closestMatchup.favoriteProbability)} / ${formatProbability(insights.closestMatchup.underdogProbability)}`}
              />
            ) : null}
            {insights.projectedHighestScoringGame ? (
              <InsightRow
                label="Highest projected total"
                matchup={matchupLabel(insights.projectedHighestScoringGame)}
                value={
                  insights.projectedHighestScoringGame.projectedTotal === null
                    ? '—'
                    : `${insights.projectedHighestScoringGame.projectedTotal} points`
                }
              />
            ) : null}
          </Stack>
        )}
      </Card>
    </Stack>
  );
};

const teamProbability = (prediction: FavoriteTeamPrediction) =>
  Math.max(0, Math.min(100, prediction.teamWinProbability * 100));

export const HomeFavoritePrediction = ({
  query,
}: {
  readonly query: QueryState;
}) => {
  const prediction = query.data?.favoriteTeamPrediction;
  const projectedScore = prediction ? projectedScoreForTeam(prediction) : null;

  return (
    <Card
      component="section"
      aria-labelledby="home-favorite-prediction"
      sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="overline" color="var(--team-primary)">
              BASELINE-V1
            </Typography>
            <Typography
              id="home-favorite-prediction"
              component="h2"
              variant="h3"
            >
              2nd &amp; 15 Prediction
            </Typography>
          </Box>
          <AutoAwesomeRounded aria-hidden="true" color="primary" />
        </Stack>
        {query.isPending ? (
          <Stack
            spacing={1.5}
            aria-busy="true"
            aria-label="Loading favorite team prediction"
          >
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={52} />
          </Stack>
        ) : query.isError ? (
          <AiError retry={query.refetch} />
        ) : !prediction ? (
          <Alert severity="info">
            No published prediction is available for your team this week.
          </Alert>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', justifyContent: 'space-around' }}
            >
              <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                <TeamHelmet team={prediction.team.abbreviation} size="sm" />
                <Typography sx={{ fontWeight: 900 }}>
                  {prediction.team.abbreviation}
                </Typography>
                <Typography variant="h4">
                  {formatProbability(prediction.teamWinProbability)}
                </Typography>
              </Stack>
              <Typography color="text.secondary">vs.</Typography>
              <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                <TeamHelmet team={prediction.opponent.abbreviation} size="sm" />
                <Typography sx={{ fontWeight: 900 }}>
                  {prediction.opponent.abbreviation}
                </Typography>
                <Typography variant="h4">
                  {formatProbability(1 - prediction.teamWinProbability)}
                </Typography>
              </Stack>
            </Stack>
            <Box>
              <LinearProgress
                variant="determinate"
                value={teamProbability(prediction)}
                aria-label={`${prediction.team.fullName} win probability ${formatProbability(prediction.teamWinProbability)}`}
                sx={{ height: 8, borderRadius: 99 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.75 }}
              >
                {prediction.isPredictedWinner
                  ? `Model favors ${prediction.team.abbreviation}`
                  : `Model favors ${prediction.opponent.abbreviation}`}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Chip
                label={`Model confidence: ${prediction.confidence}`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Weekly rank ${prediction.weeklyRank}`}
                size="small"
              />
              {projectedScore ? (
                <Typography sx={{ fontWeight: 800 }}>
                  Projected: {prediction.team.abbreviation}{' '}
                  {projectedScore.team}–{projectedScore.opponent}{' '}
                  {prediction.opponent.abbreviation}
                </Typography>
              ) : null}
            </Stack>
            <Button component={RouterLink} to="/ai" variant="contained">
              View prediction context
            </Button>
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          Probabilities are baseline model output, not a guarantee or betting
          advice. Confidence is shown separately from win probability.
        </Typography>
      </Stack>
    </Card>
  );
};

export const HomeModelPerformance = ({
  query,
}: {
  readonly query: QueryState;
}) => {
  const performance = query.data?.modelPerformance;
  const record = performance?.seasonRecord;
  return (
    <Card
      component="section"
      aria-labelledby="home-model-performance"
      sx={{ p: { xs: 2.5, md: 3 } }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { lg: 'center' } }}
      >
        <Box sx={{ minWidth: { lg: 250 } }}>
          <Typography variant="overline" color="var(--team-primary)">
            TRANSPARENT TRACK RECORD
          </Typography>
          <Typography id="home-model-performance" component="h2" variant="h3">
            2nd &amp; 15 Model Performance
          </Typography>
        </Box>
        {query.isPending ? (
          <Skeleton variant="rounded" height={74} sx={{ flex: 1 }} />
        ) : query.isError ? (
          <Box sx={{ flex: 1 }}>
            <AiError retry={query.refetch} />
          </Box>
        ) : !record || !performance ? (
          <Alert severity="info" sx={{ flex: 1 }}>
            Model performance is unavailable.
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              flex: 1,
              gap: 2,
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Preseason record
              </Typography>
              <Typography variant="h4">
                {record.correct}–{record.incorrect}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Evaluated games
              </Typography>
              <Typography variant="h4">{record.gamesEvaluated}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Accuracy
              </Typography>
              <Typography variant="h4">
                {formatNullableRate(record.accuracy)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Brier score
              </Typography>
              <Typography variant="h4">
                {formatBrierScore(record.brierScore)}
              </Typography>
            </Box>
          </Box>
        )}
        <Button component={RouterLink} to="/ai" variant="outlined">
          View all predictions
        </Button>
      </Stack>
    </Card>
  );
};
