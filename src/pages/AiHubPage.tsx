import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  FeaturedMatchup,
  MatchupEdges,
  ModelPerformance,
  ModelTransparency,
  PredictionGrid,
  QuickInsights,
  SectionError,
  SectionLoading,
  StrongestPicks,
  WeeklyIntelligence,
} from '@/features/aiHub/components/AiHubSections';
import { formatSeasonType } from '@/features/aiHub/presentation';
import {
  usePredictionsQuery,
  useWeeklyInsightsQuery,
} from '@/features/aiHub/queries';
import type { AiHubSeasonType } from '@/features/aiHub/types';
import {
  normalizeAiHubUrlState,
  serializeAiHubUrlState,
  weekLimitFor,
} from '@/features/aiHub/urlState';
import { useCurrentUserQuery } from '@/features/users/queries';

const seasonTypes: readonly AiHubSeasonType[] = ['PRE', 'REG', 'POST'];

export const AiHubPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const state = useMemo(() => normalizeAiHubUrlState(parameters), [parameters]);
  const favorite = useCurrentUserQuery().data?.favoriteTeam ?? null;
  const weeklyQuery = useWeeklyInsightsQuery({
    season: state.season,
    seasonType: state.seasonType,
    week: state.week,
    top: 5,
    ...(favorite === null ? {} : { teamId: favorite.id }),
  });
  const predictionsQuery = usePredictionsQuery({
    season: state.season,
    seasonType: state.seasonType,
    week: state.week,
    limit: 50,
  });

  useEffect(() => {
    const normalized = serializeAiHubUrlState(state);
    if (normalized.toString() !== parameters.toString()) {
      setParameters(normalized, { replace: true });
    }
  }, [parameters, setParameters, state]);

  const update = (changes: Partial<typeof state>) => {
    const nextType = changes.seasonType ?? state.seasonType;
    const requestedWeek = changes.week ?? state.week;
    const next = {
      ...state,
      ...changes,
      week: Math.min(requestedWeek, weekLimitFor(nextType)),
    };
    setParameters(serializeAiHubUrlState(next));
  };
  const contextLabel = `${state.season} ${formatSeasonType(state.seasonType)} · Week ${state.week}`;
  const featuredGameId = weeklyQuery.data
    ? favorite !== null && weeklyQuery.data.favoriteTeamPrediction !== null
      ? weeklyQuery.data.favoriteTeamPrediction.game.id
      : (weeklyQuery.data.closestMatchup?.game.id ??
        weeklyQuery.data.strongestPick?.game.id ??
        null)
    : null;
  const featuredExplanation =
    predictionsQuery.data?.find(
      (prediction) => prediction.game.id === featuredGameId,
    )?.explanation ?? null;

  return (
    <Box sx={{ pb: { xs: 7, md: 9 } }}>
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            `radial-gradient(circle at 78% 35%, ${theme.palette.primary.main}55, transparent 25%), radial-gradient(circle at 15% 90%, ${theme.palette.primary.dark}33, transparent 36%), linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            backgroundImage:
              'linear-gradient(115deg, transparent 45%, rgba(255,255,255,.12) 45.5%, transparent 46%), repeating-linear-gradient(90deg, transparent 0 70px, rgba(128,100,255,.12) 71px 72px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ py: { xs: 5, md: 8 }, position: 'relative', zIndex: 1 }}
        >
          <Stack spacing={2.5} sx={{ maxWidth: 780 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <AutoAwesomeRounded color="primary" />
              <Typography variant="overline" color="primary.light">
                2ND & 15 INTELLIGENCE
              </Typography>
            </Stack>
            <Typography
              component="h1"
              variant="h1"
              sx={{ fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 0.95 }}
            >
              AI HUB
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 650 }}
            >
              Smarter matchup insights powered by the 2nd & 15 prediction model.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button href="#all-predictions" variant="contained">
                View weekly picks
              </Button>
              <Button href="#model-performance" variant="outlined">
                Model performance
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Paper
            component="form"
            aria-label="AI Hub week controls"
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'none',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="primary.light">
                  CURRENT CONTEXT
                </Typography>
                <Typography variant="h6">{contextLabel}</Typography>
              </Box>
              <TextField
                select
                size="small"
                label="Season type"
                value={state.seasonType}
                onChange={(event) =>
                  update({ seasonType: event.target.value as AiHubSeasonType })
                }
                sx={{ minWidth: 170 }}
              >
                {seasonTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatSeasonType(type)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Week"
                value={state.week}
                onChange={(event) =>
                  update({ week: Number(event.target.value) })
                }
                sx={{ minWidth: 120 }}
              >
                {Array.from(
                  { length: weekLimitFor(state.seasonType) },
                  (_, index) => index + 1,
                ).map((week) => (
                  <MenuItem key={week} value={week}>
                    Week {week}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Paper>

          {weeklyQuery.isPending ? (
            <SectionLoading label="Loading featured matchup…" />
          ) : weeklyQuery.isError ? (
            <SectionError
              message="Weekly intelligence is temporarily unavailable. The full prediction grid may still be available below."
              onRetry={() => void weeklyQuery.refetch()}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(0, 3fr) minmax(280px, 1fr)',
                },
                gap: 2,
                alignItems: 'start',
              }}
            >
              <FeaturedMatchup
                favoritePrediction={
                  favorite === null
                    ? null
                    : weeklyQuery.data.favoriteTeamPrediction
                }
                fallback={
                  weeklyQuery.data.closestMatchup ??
                  weeklyQuery.data.strongestPick
                }
                contextLabel={contextLabel}
                hasFavorite={favorite !== null}
                explanation={featuredExplanation}
              />
              <QuickInsights insights={weeklyQuery.data} />
            </Box>
          )}

          {weeklyQuery.data ? (
            <>
              <WeeklyIntelligence insights={weeklyQuery.data} />
              <MatchupEdges insights={weeklyQuery.data} />
              <StrongestPicks insights={weeklyQuery.data} />
            </>
          ) : null}

          {predictionsQuery.isPending ? (
            <SectionLoading label="Loading weekly predictions…" />
          ) : predictionsQuery.isError ? (
            <SectionError
              message="Weekly prediction cards are temporarily unavailable. Other AI Hub sections remain available."
              onRetry={() => void predictionsQuery.refetch()}
            />
          ) : (
            <PredictionGrid predictions={predictionsQuery.data} />
          )}

          {weeklyQuery.isPending ? (
            <SectionLoading label="Loading model performance…" />
          ) : weeklyQuery.isError ? (
            <SectionError
              message="Model performance is temporarily unavailable. Weekly predictions are unaffected."
              onRetry={() => void weeklyQuery.refetch()}
            />
          ) : (
            <ModelPerformance performance={weeklyQuery.data.modelPerformance} />
          )}

          <ModelTransparency />
        </Stack>
      </Container>
    </Box>
  );
};
