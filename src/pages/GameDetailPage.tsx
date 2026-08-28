import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
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
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
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
          <Typography variant="h3" component="h1" sx={{ mt: 0.5 }}>
            Game Center
          </Typography>
        </Box>
        <GameCenterContent gameQuery={query} />
      </Stack>
    </Container>
  );
};
