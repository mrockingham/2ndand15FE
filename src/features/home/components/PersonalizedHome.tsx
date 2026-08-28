import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useWeeklyInsightsQuery } from '@/features/aiHub/queries';
import {
  HomeAiSnapshot,
  HomeFavoritePrediction,
  HomeModelPerformance,
} from '@/features/home/components/HomeAiPanels';
import {
  HomeFavoriteMatchup,
  HomeMatchupSkeleton,
} from '@/features/home/components/HomeGamesPanels';
import { HomeTeamNewsSkeleton } from '@/features/home/components/HomeNewsPanels';
import { HomeStatsLeaders } from '@/features/home/components/HomeStatsLeaders';
import { TeamEditorialSection } from '@/features/teamHub/components/TeamEditorialSection';
import { TeamHighlightsSection } from '@/features/teamHub/components/TeamHighlightsSection';
import { TeamHubHero } from '@/features/teamHub/components/TeamHubHero';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import type { Team } from '@/features/teams/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';

const greetingFor = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const TeamHubSectionError = ({
  onRetry,
  section,
}: {
  readonly onRetry: () => Promise<unknown>;
  readonly section: string;
}) => (
  <Alert
    severity="warning"
    action={
      <Button color="inherit" onClick={() => void onRetry()}>
        Retry
      </Button>
    }
  >
    {section} is temporarily unavailable. The rest of your personalized Home
    remains ready.
  </Alert>
);

export const PersonalizedHomeContent = ({
  displayName,
  favoriteTeam,
}: {
  readonly displayName: string;
  readonly favoriteTeam: Team;
}) => {
  const theme = useTheme();
  const hubQuery = useTeamHubQuery(favoriteTeam.id);
  const insightsQuery = useWeeklyInsightsQuery({
    season: 2026,
    seasonType: 'PRE',
    week: 1,
    top: 3,
    teamId: favoriteTeam.id,
  });
  const overview = hubQuery.data?.overview;
  const teamTokens = getTeamThemeTokens(
    getTeamVisualConfig(favoriteTeam.abbreviation),
    theme.palette.mode,
  );
  const banner = overview?.homepage?.banner ?? {
    imageUrl: null,
    focalX: 50,
    focalY: 50,
    overlayOpacity: 35,
  };

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      <TeamHubHero
        team={favoriteTeam}
        banner={banner}
        teamTokens={teamTokens}
        showDirectoryLink={false}
        intro={`${greetingFor(new Date())}, ${displayName}`}
        eyebrow={`${favoriteTeam.conference} ${favoriteTeam.division} · MY TEAM`}
        description="Your matchup, published team coverage, historical leaders, and weekly model context—together without pretending historical data is current."
        actions={
          <Stack
            direction={{ xs: 'column', sm: 'row', md: 'column' }}
            spacing={1.25}
          >
            <Button
              component={RouterLink}
              to={`/teams/${favoriteTeam.id}`}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
            >
              Open Team Hub
            </Button>
            <Button
              component={RouterLink}
              to="/account"
              variant="outlined"
              sx={{ color: banner.imageUrl ? '#FFFFFF' : undefined }}
            >
              Team settings
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {hubQuery.isPending ? (
          <HomeMatchupSkeleton />
        ) : hubQuery.isError || !overview ? (
          <Card sx={{ p: 2.5 }}>
            <TeamHubSectionError
              onRetry={hubQuery.refetch}
              section="Your team matchup"
            />
          </Card>
        ) : (
          <HomeFavoriteMatchup
            favoriteTeam={favoriteTeam}
            upcoming={overview.schedule.upcoming}
            recent={overview.schedule.recent}
          />
        )}
        <HomeFavoritePrediction query={insightsQuery} />
      </Box>

      {hubQuery.isPending ? (
        <HomeTeamNewsSkeleton />
      ) : hubQuery.isError || !overview ? (
        <TeamHubSectionError
          onRetry={hubQuery.refetch}
          section="Favorite-team news"
        />
      ) : overview.homepage ? (
        <TeamEditorialSection
          teamId={favoriteTeam.id}
          featuredItem={overview.homepage.editorial.featuredItem}
          supportingItems={overview.homepage.editorial.supportingItems}
        />
      ) : null}

      {hubQuery.isPending ? (
        <Skeleton
          variant="rounded"
          height={190}
          aria-label="Loading team highlights"
        />
      ) : overview?.homepage ? (
        <TeamHighlightsSection highlights={overview.homepage.highlights} />
      ) : null}

      <HomeAiSnapshot query={insightsQuery} />

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 4, lg: 3 },
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.35fr) minmax(300px, 0.65fr)',
          },
        }}
      >
        {hubQuery.isPending ? (
          <Stack
            spacing={2}
            aria-busy="true"
            aria-label="Loading historical team leaders"
          >
            <Skeleton width="48%" height={50} />
            <Skeleton variant="rounded" height={260} />
          </Stack>
        ) : hubQuery.isError || !overview ? (
          <TeamHubSectionError
            onRetry={hubQuery.refetch}
            section="Historical team leaders"
          />
        ) : (
          <HomeStatsLeaders
            preferredSeason={overview.historicalData.defaultSeason}
            teamId={favoriteTeam.id}
            teamName={favoriteTeam.name}
          />
        )}
        <Card
          component="section"
          sx={{ p: { xs: 2.5, md: 3 }, alignSelf: 'end' }}
        >
          <Stack spacing={1.5}>
            <GroupsRounded color="primary" aria-hidden="true" />
            <Typography component="h2" variant="h3">
              Explore the league
            </Typography>
            <Typography color="text.secondary">
              Compare your team’s hub with every conference and division
              opponent.
            </Typography>
            <Button component={RouterLink} to="/teams" variant="outlined">
              Explore Teams
            </Button>
            <Typography variant="caption" color="text.secondary">
              Current 2026 standings are not available, so no record or division
              table is inferred.
            </Typography>
          </Stack>
        </Card>
      </Box>

      <HomeModelPerformance query={insightsQuery} />
    </Stack>
  );
};

export const PersonalizedHome = ({
  displayName,
  favoriteTeam,
}: {
  readonly displayName: string;
  readonly favoriteTeam: Team;
}) => (
  <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <PersonalizedHomeContent
      displayName={displayName}
      favoriteTeam={favoriteTeam}
    />
  </Container>
);
