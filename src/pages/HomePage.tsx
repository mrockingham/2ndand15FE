import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { TeamIdentity } from '@/features/teams/components/TeamIdentity';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

const productSignals = [
  {
    icon: SportsFootballRounded,
    label: 'Game-day context',
  },
  {
    icon: AutoAwesomeRounded,
    label: 'Clearly labeled AI',
  },
  {
    icon: QueryStatsRounded,
    label: 'Fantasy clarity',
  },
];

const FieldPreview = () => (
  <Card
    aria-label="Preview area for a future live game experience"
    sx={{
      position: 'relative',
      minHeight: { xs: 310, sm: 390, lg: 500 },
      overflow: 'hidden',
      borderColor: 'appSurfaces.borderStrong',
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, rgba(17,25,45,0.9), rgba(4,9,19,0.98))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(235,240,250,0.96))',
      '&::before': {
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 72% 18%, rgba(107, 74, 255, 0.42), transparent 28%), radial-gradient(circle at 20% 88%, rgba(25, 204, 238, 0.18), transparent 24%)',
        content: '""',
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: { xs: '38% -12% -16%', sm: '32% -8% -20%' },
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.common.white, 0.18),
        borderRadius: '50% 50% 8% 8% / 18% 18% 8% 8%',
        backgroundColor: 'appSurfaces.field',
        backgroundImage: (theme) =>
          `repeating-linear-gradient(90deg, transparent 0, transparent 9.6%, ${alpha(
            theme.palette.common.white,
            0.17,
          )} 9.8%, transparent 10.2%), linear-gradient(180deg, ${alpha(
            theme.palette.common.white,
            0.08,
          )}, transparent)`,
        boxShadow: '0 -30px 100px rgba(79, 45, 220, 0.32)',
        transform: 'perspective(700px) rotateX(52deg)',
        transformOrigin: 'bottom center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: 2,
          bgcolor: (theme) => alpha(theme.palette.common.white, 0.25),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          width: '18%',
          aspectRatio: '1',
          border: '2px solid',
          borderColor: (theme) => alpha(theme.palette.secondary.main, 0.72),
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </Box>

    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        height: '100%',
        minHeight: 'inherit',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Chip
          icon={<BoltRounded />}
          label="FUTURE GAME CENTER"
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'primary.main',
            color: 'primary.light',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        />
        <Typography variant="overline" color="text.secondary">
          Preview
        </Typography>
      </Stack>

      <Box sx={{ maxWidth: 390 }}>
        <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
          Every snap, with context.
        </Typography>
        <Typography color="text.secondary">
          This visual area is reserved for the future live game experience. No
          live data is connected in this foundation milestone.
        </Typography>
      </Box>
    </Box>
  </Card>
);

const PublicHome = () => (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        position: 'absolute',
        top: -260,
        right: '-15%',
        width: 760,
        height: 760,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(100, 61, 238, 0.15), transparent 67%)',
        pointerEvents: 'none',
        content: '""',
      },
    }}
  >
    <Container
      maxWidth="xl"
      sx={{
        display: 'grid',
        minHeight: { md: 'calc(100vh - 72px)' },
        alignItems: 'center',
        gap: { xs: 5, md: 6, lg: 9 },
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 0.82fr) minmax(0, 1.18fr)',
        },
        py: { xs: 5, sm: 7, md: 8 },
      }}
    >
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Box>
          <Typography variant="overline" color="primary.light">
            THE NEXT DRIVE STARTS HERE
          </Typography>
          <Typography
            variant="h1"
            component="h1"
            sx={{ mt: 1.5, maxWidth: 680 }}
          >
            SEE THE GAME.
            <Box
              component="span"
              sx={{ display: 'block', color: 'primary.main' }}
            >
              READ THE MOMENT.
            </Box>
          </Typography>
        </Box>

        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ maxWidth: 590, fontWeight: 450, lineHeight: 1.55 }}
        >
          One modern home for NFL game-day context, responsible AI insight, and
          fantasy decisions—built to stay fast when the action gets loud.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRounded />}
          >
            Create your huddle
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            size="large"
          >
            Sign in
          </Button>
        </Stack>

        <Stack
          component="ul"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.25, sm: 2.5 }}
          sx={{ p: 0, m: 0, listStyle: 'none' }}
        >
          {productSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <Stack
                component="li"
                key={signal.label}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center', color: 'text.secondary' }}
              >
                <Icon color="primary" fontSize="small" aria-hidden="true" />
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  {signal.label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <FieldPreview />
    </Container>
  </Box>
);

const futureTeamModules = [
  {
    title: 'Next game',
    description:
      'Schedules and matchup context will appear here when live sports data is connected.',
  },
  {
    title: 'Latest team news',
    description:
      'Attributed reporting for your team is planned for a future data milestone.',
  },
  {
    title: 'AI matchup outlook',
    description:
      'Clearly labeled predictions will arrive with confidence and provenance.',
  },
  {
    title: 'Team standings',
    description:
      'Verified standings are not connected yet. No placeholder records are shown.',
  },
] as const;

const PersonalizedHome = () => {
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: '60vh', placeItems: 'center' }}>
        <CircularProgress aria-label="Loading your personalized home" />
      </Box>
    );
  }

  if (currentUserQuery.isError || currentUserQuery.data === undefined) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => void currentUserQuery.refetch()}>
              Retry
            </Button>
          }
        >
          We couldnâ€™t load your personalized home. Try again in a moment.
        </Alert>
      </Container>
    );
  }

  const user = currentUserQuery.data;
  const greetingName = user.displayName?.trim() || 'NFL fan';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Box>
          <Typography variant="overline" color="primary.light">
            YOUR HOME FIELD
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 1.5 }}>
            Welcome back, {greetingName}.
          </Typography>
          <Typography color="text.secondary">
            Your personalized NFL home is ready for the next data milestones.
          </Typography>
        </Box>

        {user.favoriteTeam === null ? (
          <Card sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
              <SportsFootballRounded color="primary" sx={{ fontSize: 42 }} />
              <Typography variant="h3" component="h2">
                Pick your team
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
                Choose a favorite team to shape this home around the NFL
                coverage you care about. You can skip or change it at any time.
              </Typography>
              <Button
                component={RouterLink}
                to="/choose-team"
                state={{ from: '/' }}
                variant="contained"
              >
                Choose favorite team
              </Button>
            </Stack>
          </Card>
        ) : (
          <Card
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3, sm: 4 },
              borderColor: 'appSurfaces.borderStrong',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              sx={{ position: 'relative', alignItems: { sm: 'center' } }}
            >
              <TeamIdentity team={user.favoriteTeam} size={88} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="primary.light">
                  MY TEAM
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mt: 0.5 }}>
                  {user.favoriteTeam.fullName}
                </Typography>
                <Typography color="text.secondary">
                  {user.favoriteTeam.conference} {user.favoriteTeam.division}
                </Typography>
              </Box>
              <Button component={RouterLink} to="/account" variant="outlined">
                Team settings
              </Button>
            </Stack>
          </Card>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {futureTeamModules.map((module) => (
            <Card key={module.title} sx={{ p: 2.5 }}>
              <Chip label="COMING NEXT" size="small" color="primary" />
              <Typography variant="h4" component="h2" sx={{ mt: 2, mb: 1 }}>
                {module.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Stack>
    </Container>
  );
};

export const HomePage = () => {
  const isAuthenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );

  return isAuthenticated ? <PersonalizedHome /> : <PublicHome />;
};
