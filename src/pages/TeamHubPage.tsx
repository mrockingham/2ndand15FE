import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { ArticleCard } from '@/features/articles/components/ArticleCard';
import { PlayerAttribution } from '@/features/players/components/PlayerAttribution';
import { isUuid } from '@/features/players/presentation';
import { useStatsMetadataQuery } from '@/features/statsHub/queries';
import { FavoriteTeamButton } from '@/features/teamHub/components/FavoriteTeamButton';
import { TeamLeadersSection } from '@/features/teamHub/components/TeamLeadersSection';
import { TeamRosterSection } from '@/features/teamHub/components/TeamRosterSection';
import { TeamScheduleSection } from '@/features/teamHub/components/TeamScheduleSection';
import { getTeamHubErrorMessage } from '@/features/teamHub/errors';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import type { NormalizedTeamHubUrlState } from '@/features/teamHub/types';
import {
  normalizeTeamHubUrlState,
  serializeTeamHubUrlState,
} from '@/features/teamHub/urlState';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import {
  getTeamThemeTokens,
  getTeamVisualCssVariables,
} from '@/features/teamVisualIdentity/teamTheme';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ApiError } from '@/services/api/apiClient';

const TeamHubSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 7 }}>
    <Stack spacing={3} aria-busy="true" aria-label="Loading team hub">
      <Skeleton variant="rounded" height={230} />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { md: 'repeat(3, 1fr)' },
        }}
      >
        {Array.from({ length: 3 }, (_value, index) => (
          <Skeleton key={index} variant="rounded" height={220} />
        ))}
      </Box>
      <Typography role="status">Loading team hub…</Typography>
    </Stack>
  </Container>
);

export const TeamHubPage = () => {
  const theme = useTheme();
  const { teamId = '' } = useParams();
  const validTeamId = isUuid(teamId);
  const [parameters, setParameters] = useSearchParams();
  const hubQuery = useTeamHubQuery(validTeamId ? teamId : '', validTeamId);
  const metadataQuery = useStatsMetadataQuery(hubQuery.isSuccess);
  const overview = hubQuery.data?.overview;
  const metadata = metadataQuery.data?.metadata;
  const state = useMemo(
    () =>
      overview
        ? normalizeTeamHubUrlState(parameters, overview, metadata)
        : null,
    [metadata, overview, parameters],
  );

  useEffect(() => {
    if (!state || !metadata || !overview) return;
    const normalized = serializeTeamHubUrlState(state);
    if (normalized.toString() !== parameters.toString())
      setParameters(normalized, { replace: true });
  }, [metadata, overview, parameters, setParameters, state]);

  const changeState = useCallback(
    (changes: Partial<NormalizedTeamHubUrlState>) => {
      if (!state) return;
      setParameters(serializeTeamHubUrlState({ ...state, ...changes }));
    },
    [setParameters, state],
  );

  if (!validTeamId) return <NotFoundPage />;
  if (hubQuery.isPending) return <TeamHubSkeleton />;
  if (
    hubQuery.error instanceof ApiError &&
    (hubQuery.error.status === 404 || hubQuery.error.code === 'TEAM_NOT_FOUND')
  )
    return <NotFoundPage />;
  if (hubQuery.isError || !overview || !state) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography component="h1" variant="h2" sx={{ mb: 3 }}>
          Team unavailable
        </Typography>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void hubQuery.refetch()}>
              Retry
            </Button>
          }
        >
          {getTeamHubErrorMessage(hubQuery.error)}
        </Alert>
      </Container>
    );
  }

  const { team } = overview;
  const teamTokens = getTeamThemeTokens(
    getTeamVisualConfig(team.abbreviation),
    theme.palette.mode,
  );
  const changeLeader = (
    changes: Partial<NonNullable<NormalizedTeamHubUrlState['leader']>>,
  ) => {
    if (!state.leader) return;
    changeState({ leader: { ...state.leader, ...changes } });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={5}>
        <Paper
          component="header"
          variant="outlined"
          data-team-hub-identity={team.abbreviation}
          sx={{
            ...getTeamVisualCssVariables(teamTokens),
            p: { xs: 2.5, md: 4 },
            overflow: 'hidden',
            borderColor: teamTokens.subtleBorder,
            backgroundImage: `linear-gradient(125deg, ${teamTokens.heroStart}, ${teamTokens.heroEnd} 48%, transparent 82%)`,
          }}
        >
          <Stack spacing={3}>
            <Button
              component={RouterLink}
              to="/teams"
              startIcon={<ArrowBackRounded />}
              sx={{ alignSelf: 'flex-start' }}
            >
              All teams
            </Button>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ alignItems: { md: 'center' } }}
            >
              <TeamHelmet team={team.abbreviation} size="lg" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="var(--team-primary)">
                  {team.abbreviation} · {team.conference} {team.division}
                </Typography>
                <Typography component="h1" variant="h2">
                  {team.fullName}
                </Typography>
                <Typography color="text.secondary">
                  {team.city} · {team.name} · Active NFL team
                </Typography>
              </Box>
              <Stack spacing={1.25} sx={{ alignItems: { md: 'flex-end' } }}>
                <FavoriteTeamButton teamId={team.id} teamName={team.fullName} />
                <Button
                  component={RouterLink}
                  to={`/stats?teamId=${team.id}`}
                  variant="text"
                >
                  Team-filtered Stats
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          component="nav"
          aria-label="Team hub sections"
          variant="outlined"
          sx={{ p: 1 }}
        >
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            <Button component="a" href="#overview">
              Overview
            </Button>
            <Button component="a" href="#roster">
              Historical roster
            </Button>
            <Button component="a" href="#leaders">
              Stat leaders
            </Button>
          </Stack>
        </Paper>

        <Stack id="overview" spacing={5}>
          <TeamScheduleSection
            teamId={team.id}
            season={overview.schedule.season}
            upcoming={overview.schedule.upcoming}
            recent={overview.schedule.recent}
          />

          <Box component="section" aria-labelledby="team-news-title">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography id="team-news-title" component="h2" variant="h3">
                    Published team news
                  </Typography>
                  <Typography color="text.secondary">
                    Public articles returned by the Team Hub.
                  </Typography>
                </Box>
                <Button component={RouterLink} to={`/news?teamId=${team.id}`}>
                  All News
                </Button>
              </Stack>
              {overview.news.articles.length ? (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { md: 'repeat(3, 1fr)' },
                  }}
                >
                  {overview.news.articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      favoriteTeamId={team.id}
                      headingComponent="h3"
                    />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  No published news is currently available for this team.{' '}
                  <Link component={RouterLink} to="/news">
                    Browse league News
                  </Link>
                  .
                </Alert>
              )}
            </Stack>
          </Box>
        </Stack>

        <TeamRosterSection
          teamId={team.id}
          overview={overview}
          state={state}
          onChange={changeState}
        />

        <TeamLeadersSection
          teamId={team.id}
          teamName={team.fullName}
          overview={overview}
          state={state}
          onChange={changeLeader}
        />

        <Paper component="aside" variant="outlined" sx={{ p: 2.5 }}>
          <Typography component="h2" variant="h5">
            Historical coverage
          </Typography>
          <Box component="ul" sx={{ pl: 2.5 }}>
            {overview.historicalData.coverageNotes.map((note) => (
              <li key={note}>
                <Typography>{note}</Typography>
              </li>
            ))}
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Current 2026 roster membership, injuries, depth charts,
            transactions, and live player statistics are not included.
          </Typography>
          <PlayerAttribution attribution={hubQuery.data.attribution} />
        </Paper>
      </Stack>
    </Container>
  );
};
