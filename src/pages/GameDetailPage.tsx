import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import TvOutlined from '@mui/icons-material/TvOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { GameCenterContent } from '@/features/games/components/GameCenterContent';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import { getGameDisplayLabel } from '@/features/games/presentation';
import { useGameQuery } from '@/features/games/queries';
import { ApiError } from '@/services/api/apiClient';

export const GameDetailPage = () => {
  const { gameId = '' } = useParams();
  const query = useGameQuery(gameId);

  if (query.data === undefined) {
    if (query.isPending) {
      return (
        <Box sx={{ display: 'grid', minHeight: '55vh', placeItems: 'center' }}>
          <CircularProgress aria-label="Loading game details" />
        </Box>
      );
    }
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
            Game Center
          </Typography>
          {venue === '' && game.broadcastNetwork === null ? null : (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              sx={{ mt: 1 }}
            >
              {venue === '' ? null : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <LocationOnOutlined
                    color="primary"
                    fontSize="small"
                    aria-hidden="true"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {venue}
                  </Typography>
                </Stack>
              )}
              {game.broadcastNetwork === null ? null : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <TvOutlined
                    color="primary"
                    fontSize="small"
                    aria-hidden="true"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {game.broadcastNetwork}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Box>
        <GameCenterContent gameQuery={query} />
      </Stack>
    </Container>
  );
};
