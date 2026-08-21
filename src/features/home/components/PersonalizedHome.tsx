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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
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
import {
  HomeTeamNews,
  HomeTeamNewsSkeleton,
} from '@/features/home/components/HomeNewsPanels';
import { HomeStatsLeaders } from '@/features/home/components/HomeStatsLeaders';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import type { Team } from '@/features/teams/types';

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

const FavoriteHero = ({
  displayName,
  team,
}: {
  readonly displayName: string;
  readonly team: Team;
}) => (
  <Card
    component="header"
    sx={{
      position: 'relative',
      isolation: 'isolate',
      minHeight: { xs: 330, md: 360 },
      overflow: 'hidden',
      borderColor: 'var(--team-border)',
      backgroundImage:
        'linear-gradient(115deg, var(--team-hero-start), var(--team-hero-end) 56%, transparent 88%)',
      '&::after': {
        position: 'absolute',
        inset: 'auto -8% -60% 38%',
        zIndex: -1,
        height: '120%',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, var(--team-subtle-strong), transparent 70%)',
        content: '""',
      },
    }}
  >
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={3}
      sx={{
        minHeight: 'inherit',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        p: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Typography color="text.secondary">
          {greetingFor(new Date())}, {displayName}
        </Typography>
        <Box>
          <Typography variant="overline" color="var(--team-primary)">
            {team.conference} {team.division} · MY TEAM
          </Typography>
          <Typography component="h1" variant="h2">
            {team.fullName}
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ maxWidth: 580 }}>
          Your matchup, published team coverage, historical leaders, and weekly
          model context—together without pretending historical data is current.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <Button
            component={RouterLink}
            to={`/teams/${team.id}`}
            variant="contained"
            endIcon={<ArrowForwardRounded />}
          >
            Open Team Hub
          </Button>
          <Button component={RouterLink} to="/account" variant="outlined">
            Team settings
          </Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          alignSelf: { xs: 'center', md: 'center' },
          filter: 'drop-shadow(0 28px 34px rgba(0,0,0,0.32))',
          transform: { md: 'scale(1.22)' },
        }}
      >
        <TeamHelmet team={team.abbreviation} size="lg" />
      </Box>
    </Stack>
  </Card>
);

export const PersonalizedHome = ({
  displayName,
  favoriteTeam,
}: {
  readonly displayName: string;
  readonly favoriteTeam: Team;
}) => {
  const hubQuery = useTeamHubQuery(favoriteTeam.id);
  const insightsQuery = useWeeklyInsightsQuery({
    season: 2026,
    seasonType: 'PRE',
    week: 1,
    top: 3,
    teamId: favoriteTeam.id,
  });
  const overview = hubQuery.data?.overview;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={{ xs: 4, md: 5 }}>
        <FavoriteHero displayName={displayName} team={favoriteTeam} />

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

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, lg: 3 },
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1.35fr) minmax(340px, 0.65fr)',
            },
          }}
        >
          {hubQuery.isPending ? (
            <HomeTeamNewsSkeleton />
          ) : hubQuery.isError || !overview ? (
            <TeamHubSectionError
              onRetry={hubQuery.refetch}
              section="Favorite-team news"
            />
          ) : (
            <HomeTeamNews
              articles={overview.news.articles}
              favoriteTeamId={favoriteTeam.id}
              teamName={favoriteTeam.name}
            />
          )}
          <HomeAiSnapshot query={insightsQuery} />
        </Box>

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
                Current 2026 standings are not available, so no record or
                division table is inferred.
              </Typography>
            </Stack>
          </Card>
        </Box>

        <HomeModelPerformance query={insightsQuery} />
      </Stack>
    </Container>
  );
};
