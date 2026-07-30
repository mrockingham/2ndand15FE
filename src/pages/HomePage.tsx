import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

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

export const HomePage = () => (
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
            to="/games"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRounded />}
          >
            Preview game day
          </Button>
          <Button
            component={RouterLink}
            to="/ai"
            variant="outlined"
            size="large"
          >
            Explore the AI vision
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
