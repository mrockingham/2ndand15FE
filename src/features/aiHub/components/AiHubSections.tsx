import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  formatBrierScore,
  formatFactorCode,
  formatNullableRate,
  formatProbability,
  matchupLabel,
} from '@/features/aiHub/presentation';
import type {
  FavoriteTeamPrediction,
  PublicPrediction,
  WeeklyFeatureEdge,
  WeeklyInsightCard,
  WeeklyInsights,
} from '@/features/aiHub/types';
import { formatGameDateTime } from '@/features/games/utils/dateTime';

const cardSx = {
  border: '1px solid',
  borderColor: 'divider',
  backgroundImage: 'none',
  overflow: 'hidden',
} as const;

const SectionHeading = ({
  eyebrow,
  title,
  action,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly action?: ReactNode;
}) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Box>
      {eyebrow ? (
        <Typography variant="overline" color="primary.light">
          {eyebrow}
        </Typography>
      ) : null}
      <Typography component="h2" variant="h5">
        {title}
      </Typography>
    </Box>
    {action}
  </Stack>
);

export const SectionLoading = ({ label }: { readonly label: string }) => (
  <Paper sx={{ ...cardSx, p: 3 }} role="status">
    <Typography sx={{ mb: 2 }}>{label}</Typography>
    <Skeleton height={120} variant="rounded" />
  </Paper>
);

export const SectionError = ({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" onClick={onRetry}>
        Retry
      </Button>
    }
  >
    {message}
  </Alert>
);

const MatchupTeam = ({
  abbreviation,
  name,
  probability,
  side,
}: {
  readonly abbreviation: string;
  readonly name: string;
  readonly probability: number;
  readonly side: 'Away' | 'Home';
}) => (
  <Stack
    spacing={1}
    sx={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}
  >
    <Typography variant="overline" color="text.secondary">
      {side}
    </Typography>
    <TeamHelmet team={abbreviation} size="lg" />
    <Typography variant="h5" sx={{ fontWeight: 900 }}>
      {abbreviation}
    </Typography>
    <Typography color="text.secondary" variant="body2">
      {name}
    </Typography>
    <Typography variant="h4" color="primary.light" sx={{ fontWeight: 900 }}>
      {formatProbability(probability)}
    </Typography>
  </Stack>
);

interface FeaturedMatchupProps {
  readonly favoritePrediction: FavoriteTeamPrediction | null;
  readonly fallback: WeeklyInsightCard | null;
  readonly contextLabel: string;
  readonly hasFavorite: boolean;
  readonly explanation: PublicPrediction['explanation'];
}

export const FeaturedMatchup = ({
  favoritePrediction,
  fallback,
  contextLabel,
  hasFavorite,
  explanation,
}: FeaturedMatchupProps) => {
  if (favoritePrediction === null && fallback === null) {
    return (
      <Paper component="section" sx={{ ...cardSx, p: 3 }}>
        <Typography component="h2" variant="h5">
          Featured matchup
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          No reviewed prediction is available for this week yet.
        </Typography>
      </Paper>
    );
  }

  const game = favoritePrediction?.game ?? fallback!.game;
  const teamIsHome =
    favoritePrediction !== null &&
    game.homeTeam.id === favoritePrediction.team.id;
  const homeProbability =
    favoritePrediction === null
      ? fallback!.favorite.id === game.homeTeam.id
        ? fallback!.favoriteProbability
        : fallback!.underdogProbability
      : teamIsHome
        ? favoritePrediction.teamWinProbability
        : 1 - favoritePrediction.teamWinProbability;
  const awayProbability = 1 - homeProbability;
  const projectedScore =
    favoritePrediction?.projectedScore ?? fallback!.projectedScore;
  const winner =
    favoritePrediction === null
      ? fallback!.favorite
      : favoritePrediction.isPredictedWinner
        ? favoritePrediction.team
        : favoritePrediction.opponent;
  const confidence = favoritePrediction?.confidence ?? fallback!.confidence;
  const factors = favoritePrediction?.factors ?? fallback!.factors;
  const rank = favoritePrediction?.weeklyRank ?? fallback!.rank;

  return (
    <Paper
      component="section"
      id="featured-matchup"
      aria-labelledby="featured-matchup-title"
      sx={{
        ...cardSx,
        p: { xs: 2.5, md: 4 },
        position: 'relative',
        background: (theme) =>
          `radial-gradient(circle at 50% 0%, ${theme.palette.primary.main}2e, transparent 45%), linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        ...(favoritePrediction === null
          ? {}
          : {
              borderColor: 'var(--team-border)',
              boxShadow: 'inset 4px 0 0 var(--team-primary)',
            }),
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="overline" color="primary.light">
              AI MATCHUP PREDICTION
            </Typography>
            <Typography id="featured-matchup-title" component="h2" variant="h4">
              {favoritePrediction !== null
                ? `${favoritePrediction.team.abbreviation} matchup spotlight`
                : 'Closest game this week'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Chip
              label={`${confidence} confidence`}
              color="primary"
              variant="outlined"
            />
            <Chip label={`Rank #${rank}`} variant="outlined" />
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr auto 1fr', md: '1fr 180px 1fr' },
            gap: { xs: 1, md: 3 },
            alignItems: 'center',
          }}
        >
          <MatchupTeam
            abbreviation={game.awayTeam.abbreviation}
            name={game.awayTeam.fullName}
            probability={awayProbability}
            side="Away"
          />
          <Stack spacing={1} sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="overline">Projected</Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
            >
              {projectedScore === null
                ? '—'
                : `${projectedScore.away} – ${projectedScore.home}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {contextLabel}
            </Typography>
          </Stack>
          <MatchupTeam
            abbreviation={game.homeTeam.abbreviation}
            name={game.homeTeam.fullName}
            probability={homeProbability}
            side="Home"
          />
        </Box>

        <Box>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', mb: 0.75 }}
          >
            <Typography variant="caption">
              {game.awayTeam.abbreviation} probability
            </Typography>
            <Typography variant="caption">
              {game.homeTeam.abbreviation} probability
            </Typography>
          </Stack>
          <LinearProgress
            aria-label={`${game.awayTeam.abbreviation} ${formatProbability(awayProbability)}, ${game.homeTeam.abbreviation} ${formatProbability(homeProbability)}`}
            variant="determinate"
            value={awayProbability * 100}
            sx={{ height: 10, borderRadius: 999 }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md:
                explanation !== null || factors.length > 0
                  ? 'minmax(0, 2fr) 1fr'
                  : '1fr',
            },
            gap: 2,
          }}
        >
          {explanation !== null ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Published model explanation
              </Typography>
              <Typography variant="body2">{explanation.summary}</Typography>
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                {explanation.keyReasons.slice(0, 3).map((reason) => (
                  <Stack key={reason} direction="row" spacing={1}>
                    <AutoAwesomeRounded color="primary" fontSize="small" />
                    <Typography variant="body2">{reason}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ) : factors.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Why the model leans {winner.abbreviation}
              </Typography>
              <Stack spacing={0.75}>
                {factors.slice(0, 4).map((factor) => (
                  <Stack
                    key={`${factor.code}-${factor.favors}`}
                    direction="row"
                    spacing={1}
                  >
                    <AutoAwesomeRounded color="primary" fontSize="small" />
                    <Typography variant="body2">{factor.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ) : null}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              alignSelf: 'stretch',
            }}
          >
            <Typography variant="overline">Predicted winner</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {winner.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model confidence remains {confidence}. No overall certainty is
              implied.
            </Typography>
            <Button
              component={RouterLink}
              to={`/games/${game.id}`}
              size="small"
              sx={{ mt: 1.5 }}
            >
              Game Center
            </Button>
          </Box>
        </Box>
        {hasFavorite && favoritePrediction === null ? (
          <Alert severity="info">
            Your favorite team has no reviewed prediction in this selected week,
            so the closest general matchup is featured instead.
          </Alert>
        ) : null}
      </Stack>
    </Paper>
  );
};

const InsightCard = ({
  title,
  card,
  detail,
}: {
  readonly title: string;
  readonly card: WeeklyInsightCard | null;
  readonly detail?: string;
}) => (
  <Paper sx={{ ...cardSx, p: 2.25, minHeight: 178 }}>
    <Typography variant="overline" color="primary.light">
      {title}
    </Typography>
    {card === null ? (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Not available for this week.
      </Typography>
    ) : (
      <Stack spacing={1.25} sx={{ mt: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TeamHelmet team={card.favorite.abbreviation} size="sm" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {card.favorite.abbreviation} over {card.underdog.abbreviation}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {matchupLabel(card)}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="h5" color="primary.light" sx={{ fontWeight: 900 }}>
          {detail ?? formatProbability(card.favoriteProbability)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {card.projectedScore === null
            ? 'Projected score unavailable'
            : `Projected ${card.projectedScore.away}–${card.projectedScore.home}`}{' '}
          · {card.confidence} confidence
        </Typography>
      </Stack>
    )}
  </Paper>
);

export const WeeklyIntelligence = ({
  insights,
}: {
  readonly insights: WeeklyInsights;
}) => (
  <Box
    component="section"
    id="weekly-intelligence"
    aria-labelledby="weekly-intelligence-title"
  >
    <SectionHeading eyebrow="WEEKLY SIGNALS" title="Weekly intelligence" />
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          xl: 'repeat(3, 1fr)',
        },
        gap: 2,
        mt: 2,
      }}
    >
      <InsightCard title="Strongest pick" card={insights.strongestPick} />
      <InsightCard title="Closest matchup" card={insights.closestMatchup} />
      <InsightCard
        title="Upset watch"
        card={insights.upsetWatch}
        detail={
          insights.upsetWatch === null
            ? undefined
            : insights.upsetWatch.basis === 'HISTORICAL_STRENGTH_REVERSAL'
              ? 'Historical-strength reversal'
              : 'Model uncertainty'
        }
      />
      <InsightCard
        title="Most likely blowout"
        card={insights.mostLikelyBlowout}
      />
      <InsightCard
        title="Highest projected total"
        card={insights.projectedHighestScoringGame}
        detail={
          insights.projectedHighestScoringGame?.projectedTotal === null ||
          insights.projectedHighestScoringGame?.projectedTotal === undefined
            ? undefined
            : `${insights.projectedHighestScoringGame.projectedTotal} points`
        }
      />
      <InsightCard
        title="Lowest projected total"
        card={insights.projectedLowestScoringGame}
        detail={
          insights.projectedLowestScoringGame?.projectedTotal === null ||
          insights.projectedLowestScoringGame?.projectedTotal === undefined
            ? undefined
            : `${insights.projectedLowestScoringGame.projectedTotal} points`
        }
      />
    </Box>
  </Box>
);

const EdgeCard = ({
  title,
  icon,
  edge,
}: {
  readonly title: string;
  readonly icon: ReactNode;
  readonly edge: WeeklyFeatureEdge | null;
}) => (
  <Paper sx={{ ...cardSx, p: 2.5 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <Typography variant="overline" color="primary.light">
        {title}
      </Typography>
    </Stack>
    {edge === null ? (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Comparable historical evidence is unavailable.
      </Typography>
    ) : (
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TeamHelmet team={edge.team.abbreviation} size="md" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {edge.team.abbreviation} over {edge.opponent.abbreviation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Relative edge strength {formatProbability(edge.edgeScore)}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={0.5}>
          {edge.supportingFactors.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No supporting factor label was returned.
            </Typography>
          ) : (
            edge.supportingFactors.map((factor) => (
              <Typography key={factor} variant="body2">
                • {formatFactorCode(factor)}
              </Typography>
            ))
          )}
        </Stack>
      </Stack>
    )}
  </Paper>
);

export const MatchupEdges = ({
  insights,
}: {
  readonly insights: WeeklyInsights;
}) => (
  <Box
    component="section"
    id="matchup-edges"
    aria-labelledby="matchup-edges-title"
  >
    <SectionHeading eyebrow="HISTORICAL COMPARISONS" title="Matchup edges" />
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        mt: 2,
      }}
    >
      <EdgeCard
        title="Offensive edge"
        icon={<TrendingUpRounded color="primary" />}
        edge={insights.offensiveEdge}
      />
      <EdgeCard
        title="Defensive edge"
        icon={<SecurityRounded color="primary" />}
        edge={insights.defensiveEdge}
      />
      <EdgeCard
        title="Turnover profile edge"
        icon={<BoltRounded color="primary" />}
        edge={insights.turnoverProfileEdge}
      />
    </Box>
  </Box>
);

export const StrongestPicks = ({
  insights,
}: {
  readonly insights: WeeklyInsights;
}) => (
  <Paper
    component="section"
    id="strongest-picks"
    sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}
  >
    <SectionHeading eyebrow="MODEL RANKING" title="Strongest picks this week" />
    {insights.confidenceRanking.length === 0 ? (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No ranked picks are available.
      </Typography>
    ) : (
      <Stack
        divider={
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
        }
        sx={{ mt: 2 }}
      >
        {insights.confidenceRanking.slice(0, 5).map((card) => (
          <Stack
            key={card.game.id}
            direction="row"
            spacing={1.5}
            sx={{ py: 1.5, alignItems: 'center' }}
          >
            <Typography variant="h6" color="primary.light" sx={{ width: 28 }}>
              {card.rank}
            </Typography>
            <TeamHelmet team={card.favorite.abbreviation} size="sm" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }}>
                {card.favorite.abbreviation} over {card.underdog.abbreviation}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.confidence} confidence
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900 }}>
              {formatProbability(card.favoriteProbability)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    )}
  </Paper>
);

export const QuickInsights = ({
  insights,
}: {
  readonly insights: WeeklyInsights;
}) => {
  const items = [
    insights.strongestPick === null
      ? null
      : `Strongest: ${insights.strongestPick.favorite.abbreviation} at ${formatProbability(insights.strongestPick.favoriteProbability)}`,
    insights.closestMatchup === null
      ? null
      : `Closest: ${matchupLabel(insights.closestMatchup)}`,
    insights.upsetWatch === null
      ? null
      : `Upset watch: ${insights.upsetWatch.opportunityTeam.abbreviation}`,
    insights.projectedHighestScoringGame === null
      ? null
      : `Highest total: ${matchupLabel(insights.projectedHighestScoringGame)}`,
  ].filter((item): item is string => item !== null);

  return (
    <Paper component="aside" sx={{ ...cardSx, p: 2.5 }}>
      <Typography variant="overline" color="primary.light">
        AI HUB QUICK INSIGHTS
      </Typography>
      <Typography component="h2" variant="h6">
        This week’s insights
      </Typography>
      <Stack spacing={1} sx={{ mt: 2 }}>
        {items.map((item) => (
          <Link
            key={item}
            href="#weekly-intelligence"
            underline="none"
            sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}
          >
            {item}
          </Link>
        ))}
      </Stack>
      <Button
        href="#all-predictions"
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
      >
        View all weekly picks
      </Button>
    </Paper>
  );
};

const PredictionCard = ({
  prediction,
}: {
  readonly prediction: PublicPrediction;
}) => {
  const projected =
    prediction.projectedAwayScore === null ||
    prediction.projectedHomeScore === null
      ? '—'
      : `${prediction.projectedAwayScore}–${prediction.projectedHomeScore}`;
  return (
    <Paper
      sx={{ ...cardSx, p: 2.25, display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="caption" color="text.secondary">
        {formatGameDateTime(prediction.game)}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 1,
          alignItems: 'center',
          my: 2,
          textAlign: 'center',
        }}
      >
        <Stack sx={{ alignItems: 'center' }}>
          <TeamHelmet team={prediction.game.awayTeam.abbreviation} size="md" />
          <Typography sx={{ fontWeight: 900 }}>
            {prediction.game.awayTeam.abbreviation}
          </Typography>
          <Typography variant="body2">
            {formatProbability(prediction.awayWinProbability)}
          </Typography>
        </Stack>
        <Box>
          <Typography variant="overline">Projected</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {projected}
          </Typography>
        </Box>
        <Stack sx={{ alignItems: 'center' }}>
          <TeamHelmet team={prediction.game.homeTeam.abbreviation} size="md" />
          <Typography sx={{ fontWeight: 900 }}>
            {prediction.game.homeTeam.abbreviation}
          </Typography>
          <Typography variant="body2">
            {formatProbability(prediction.homeWinProbability)}
          </Typography>
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Predicted winner:{' '}
        {prediction.predictedWinner?.fullName ?? 'Unavailable'}
      </Typography>
      <Chip
        label={`${prediction.confidence} confidence`}
        size="small"
        variant="outlined"
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      />
      <Button
        component={RouterLink}
        to={`/games/${prediction.game.id}`}
        sx={{ mt: 'auto', pt: 2 }}
      >
        Game Center
      </Button>
    </Paper>
  );
};

export const PredictionGrid = ({
  predictions,
}: {
  readonly predictions: readonly PublicPrediction[];
}) => (
  <Box
    component="section"
    id="all-predictions"
    aria-labelledby="all-predictions-title"
  >
    <SectionHeading
      eyebrow="REVIEWED MODEL OUTPUTS"
      title="All weekly predictions"
      action={<Chip label={`${predictions.length} games`} variant="outlined" />}
    />
    {predictions.length === 0 ? (
      <Alert severity="info" sx={{ mt: 2 }}>
        No published predictions are available for this selected week.
      </Alert>
    ) : (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: 2,
          mt: 2,
        }}
      >
        {predictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </Box>
    )}
  </Box>
);

export const ModelPerformance = ({
  performance,
}: {
  readonly performance: WeeklyInsights['modelPerformance'];
}) => {
  const record = performance.seasonRecord;
  return (
    <Paper
      component="section"
      id="model-performance"
      sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}
    >
      <SectionHeading
        eyebrow="PUBLISHED EVALUATION"
        title="2nd & 15 Model Performance"
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mt: 2.5,
        }}
      >
        {[
          ['Record', `${record.correct}–${record.incorrect}`],
          ['Games evaluated', String(record.gamesEvaluated)],
          ['Accuracy', formatNullableRate(record.accuracy)],
          ['Brier score', formatBrierScore(record.brierScore)],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      {record.gamesEvaluated === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No published predictions have been evaluated yet. Accuracy and Brier
          score will appear after final games are evaluated.
        </Typography>
      ) : null}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 2 }}
      >
        Model version {performance.modelVersion}. Accuracy excludes ties; the
        Brier score measures probability calibration.
      </Typography>
    </Paper>
  );
};

export const ModelTransparency = () => (
  <Paper component="section" sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <InsightsRounded color="primary" />
      <Typography component="h2" variant="h5">
        How predictions work
      </Typography>
    </Stack>
    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 900 }}>
      baseline-v1 uses historical team strength, recent offensive production,
      turnover profile, defensive disruption, and home or neutral-site context.
      The numerical prediction is deterministic; it is not generated by a chat
      model.
    </Typography>
    <Alert icon={<SportsFootballRounded />} severity="info" sx={{ mt: 2 }}>
      Preseason predictions carry lower confidence because roster usage and
      playing time are less predictable.
    </Alert>
  </Paper>
);
