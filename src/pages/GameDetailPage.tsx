import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import TvOutlined from '@mui/icons-material/TvOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import {
  getGameDisplayLabel,
  isScoreStatus,
} from '@/features/games/presentation';
import { useGameQuery } from '@/features/games/queries';
import { formatGameDateTime } from '@/features/games/utils/dateTime';
import { ApiError } from '@/services/api/apiClient';

export const GameDetailPage = () => {
  const { gameId = '' } = useParams();
  const query = useGameQuery(gameId);

  if (query.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: '55vh', placeItems: 'center' }}>
        <CircularProgress aria-label="Loading game details" />
      </Box>
    );
  }
  if (query.isError) {
    const notFound =
      query.error instanceof ApiError && query.error.status === 404;
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1">
            {notFound ? 'Game not found' : 'Game unavailable'}
          </Typography>
          <Alert severity="error">
            {getPublicGameErrorMessage(query.error)}
          </Alert>
          <Button
            component={RouterLink}
            to="/games"
            startIcon={<ArrowBackRounded />}
          >
            Back to Games
          </Button>
        </Stack>
      </Container>
    );
  }

  const game = query.data;
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const awayWins =
    canShowScore &&
    game.status === 'FINAL' &&
    game.awayScore! > game.homeScore!;
  const homeWins =
    canShowScore &&
    game.status === 'FINAL' &&
    game.homeScore! > game.awayScore!;
  const venue = [game.venue.name, game.venue.city].filter(Boolean).join(' · ');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          to="/games"
          startIcon={<ArrowBackRounded />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to Games
        </Button>
        <Box>
          <Typography variant="overline" color="primary.light">
            {game.season} · {getGameDisplayLabel(game)}
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 0.75 }}>
            Game details
          </Typography>
        </Box>
        <Card
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderColor: 'appSurfaces.borderStrong',
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                justifyContent: 'space-between',
                alignItems: { sm: 'center' },
              }}
            >
              <Box>
                <Typography variant="h5">{formatGameDateTime(game)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Displayed in your local timezone
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <GameStatusChip status={game.status} />
                {game.isNeutralSite ? (
                  <Chip label="Neutral site" variant="outlined" />
                ) : null}
              </Stack>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                alignItems: 'center',
              }}
            >
              <Stack
                spacing={1}
                sx={{
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
                aria-label={`Away team ${game.awayTeam.fullName}${canShowScore ? `, ${game.awayScore} points` : ''}`}
              >
                <TeamHelmet team={game.awayTeam.abbreviation} size="lg" />
                <Typography variant="overline">AWAY</Typography>
                <Typography variant="h3">{game.awayTeam.fullName}</Typography>
                {canShowScore ? (
                  <Typography
                    variant="h2"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: awayWins ? 950 : 700,
                    }}
                  >
                    {game.awayScore}
                  </Typography>
                ) : null}
              </Stack>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                @
              </Typography>
              <Stack
                spacing={1}
                sx={{
                  alignItems: { xs: 'center', sm: 'flex-end' },
                  textAlign: { xs: 'center', sm: 'right' },
                }}
                aria-label={`Home team ${game.homeTeam.fullName}${canShowScore ? `, ${game.homeScore} points` : ''}`}
              >
                <TeamHelmet team={game.homeTeam.abbreviation} size="lg" />
                <Typography variant="overline">HOME</Typography>
                <Typography variant="h3">{game.homeTeam.fullName}</Typography>
                {canShowScore ? (
                  <Typography
                    variant="h2"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: homeWins ? 950 : 700,
                    }}
                  >
                    {game.homeScore}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
            {game.status === 'IN_PROGRESS' || game.status === 'HALFTIME' ? (
              <Typography sx={{ textAlign: 'center', fontWeight: 800 }}>
                {game.status === 'HALFTIME'
                  ? 'Halftime'
                  : [
                      game.quarter === null ? null : `Quarter ${game.quarter}`,
                      game.clock,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </Typography>
            ) : null}
            {venue === '' && game.broadcastNetwork === null ? null : (
              <Divider />
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
              {venue === '' ? null : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <LocationOnOutlined color="primary" aria-hidden="true" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      VENUE
                    </Typography>
                    <Typography>{venue}</Typography>
                  </Box>
                </Stack>
              )}
              {game.broadcastNetwork === null ? null : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <TvOutlined color="primary" aria-hidden="true" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      BROADCAST
                    </Typography>
                    <Typography>{game.broadcastNetwork}</Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
