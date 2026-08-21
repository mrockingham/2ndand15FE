import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { FavoriteNextGame } from '@/features/games/components/FavoriteNextGame';
import { GameCard } from '@/features/games/components/GameCard';
import { useGamesQuery } from '@/features/games/queries';
import type { Team } from '@/features/teams/types';

interface HomeGamesSectionProps {
  readonly favoriteTeam?: Team | null;
  readonly signedIn: boolean;
}

const PublicUpcomingGames = () => {
  const query = useGamesQuery({});

  if (query.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: 180, placeItems: 'center' }}>
        <CircularProgress aria-label="Loading upcoming games" />
      </Box>
    );
  }
  if (query.isError) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/games">
            Open Games
          </Button>
        }
      >
        Upcoming games could not be loaded. The rest of Home is still available.
      </Alert>
    );
  }
  const games = query.data.pages.flatMap((page) => page.games).slice(0, 3);
  if (games.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h4" component="h2">
          Explore the 2026 schedule
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Browse preseason and regular-season games week by week.
        </Typography>
        <Button component={RouterLink} to="/games" sx={{ mt: 2 }}>
          View Games
        </Button>
      </Card>
    );
  }
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
      }}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </Box>
  );
};

export const HomeGamesSection = ({
  favoriteTeam,
  signedIn,
}: HomeGamesSectionProps) => (
  <Container
    component="section"
    maxWidth="xl"
    sx={{
      // py: { xs: 4, sm: 6 },
      borderRadius: '14px',
      border: '1px solid black',
    }}
    aria-labelledby="home-games-heading"
  >
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'end' } }}
      >
        <Box>
          <Typography variant="overline" color="primary.light">
            Live & Upcoming
          </Typography>
        </Box>
        <Button component={RouterLink} to="/games">
          View all games
        </Button>
      </Stack>
      {signedIn && favoriteTeam === undefined ? (
        <Box sx={{ display: 'grid', minHeight: 180, placeItems: 'center' }}>
          <CircularProgress aria-label="Loading personalized schedule" />
        </Box>
      ) : signedIn && favoriteTeam ? (
        <FavoriteNextGame team={favoriteTeam} />
      ) : signedIn ? (
        <Card sx={{ p: 3 }}>
          <SportsFootballRounded color="primary" />
          <Typography variant="h4" component="h3" sx={{ mt: 1 }}>
            Choose a team for your next game
          </Typography>
          <Button component={RouterLink} to="/choose-team" sx={{ mt: 1.5 }}>
            Choose favorite team
          </Button>
        </Card>
      ) : (
        <PublicUpcomingGames />
      )}
    </Stack>
  </Container>
);
