import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import { useTeamGamesQuery } from '@/features/games/queries';
import type { Game } from '@/features/games/types';
import {
  compareGamesForNext,
  formatGameDateTime,
  isGameUpcoming,
} from '@/features/games/utils/dateTime';
import { TeamHelmet } from '@/components/team/TeamHelmet';
import type { Team } from '@/features/teams/types';

interface FavoriteNextGameProps {
  readonly team: Pick<
    Team,
    'id' | 'fullName' | 'abbreviation' | 'logoUrl' | 'primaryColor'
  >;
}

const opponentFor = (game: Game, teamId: string) =>
  game.homeTeam.id === teamId ? game.awayTeam : game.homeTeam;

export const FavoriteNextGame = ({ team }: FavoriteNextGameProps) => {
  const query = useTeamGamesQuery(team.id, { limit: 100 });

  if (query.isPending) {
    return (
      <Card sx={{ display: 'grid', minHeight: 220, placeItems: 'center' }}>
        <CircularProgress aria-label={`Loading ${team.fullName} next game`} />
      </Card>
    );
  }
  if (query.isError) {
    return (
      <Alert
        severity="warning"
        action={<Button onClick={() => void query.refetch()}>Retry</Button>}
      >
        {getPublicGameErrorMessage(query.error)}
      </Alert>
    );
  }

  const nextGame = query.data.games
    .filter((game) => isGameUpcoming(game))
    .sort(compareGamesForNext)[0];
  if (nextGame === undefined) {
    return (
      <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="overline" color="primary.light">
          NEXT GAME
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mt: 0.5 }}>
          No remaining game
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          No scheduled or pregame matchup remains in the current-season team
          schedule.
        </Typography>
        <Button
          component={RouterLink}
          to={`/games?team=${team.id}`}
          sx={{ mt: 2 }}
        >
          View team schedule
        </Button>
      </Card>
    );
  }

  const opponent = opponentFor(nextGame, team.id);
  const homeContext = nextGame.homeTeam.id === team.id ? 'vs.' : 'at';
  const venue = [nextGame.venue.name, nextGame.venue.city]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      sx={{ p: { xs: 2.5, sm: 3 }, borderColor: 'appSurfaces.borderStrong' }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="overline" color="primary.light">
            NEXT GAME
          </Typography>
          <GameStatusChip status={nextGame.status} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TeamHelmet team={opponent.abbreviation} size="md" />
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary">
              {team.abbreviation} {homeContext}
            </Typography>
            <Typography variant="h4" component="h2">
              {opponent.fullName}
            </Typography>
          </Box>
        </Stack>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>
            {formatGameDateTime(nextGame)}
          </Typography>
          {venue === '' ? null : (
            <Typography variant="body2" color="text.secondary">
              {venue}
            </Typography>
          )}
          {nextGame.broadcastNetwork === null ? null : (
            <Typography variant="body2" color="text.secondary">
              Watch on {nextGame.broadcastNetwork}
            </Typography>
          )}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component={RouterLink}
            to={`/games/${nextGame.id}`}
            variant="contained"
            endIcon={<ArrowForwardRounded />}
          >
            Game details
          </Button>
          <Button
            component={RouterLink}
            to={`/games?team=${team.id}`}
            variant="outlined"
          >
            Team schedule
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
