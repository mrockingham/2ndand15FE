import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { GameCard } from '@/features/games/components/GameCard';
import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import {
  getGameDisplayLabel,
  isScoreStatus,
} from '@/features/games/presentation';
import type { Game } from '@/features/games/types';
import { formatGameDateTime } from '@/features/games/utils/dateTime';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { Team } from '@/features/teams/types';

interface GamesQueryState {
  readonly data?: {
    readonly pages: readonly { readonly games: readonly Game[] }[];
  };
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly refetch: () => Promise<unknown>;
}

export const HomeGamesGrid = ({
  query,
}: {
  readonly query: GamesQueryState;
}) => {
  const games =
    query.data?.pages.flatMap((page) => page.games).slice(0, 4) ?? [];
  return (
    <Stack component="section" spacing={2} aria-labelledby="home-games-heading">
      <HomeSectionHeader
        eyebrow="CURRENT SCHEDULE"
        title="Recent & upcoming games"
        actionLabel="View all games"
        actionTo="/games"
      />
      {query.isPending ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
          aria-busy="true"
          aria-label="Loading recent and upcoming games"
        >
          {Array.from({ length: 4 }, (_value, index) => (
            <Skeleton key={index} variant="rounded" height={210} />
          ))}
        </Box>
      ) : query.isError ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        >
          Games are temporarily unavailable. News, Stats, and AI Hub remain
          available.
        </Alert>
      ) : games.length === 0 ? (
        <Alert severity="info">
          No recent or upcoming games are available in this window.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </Box>
      )}
    </Stack>
  );
};

const gameOpponent = (game: Game, teamId: string) =>
  game.homeTeam.id === teamId ? game.awayTeam : game.homeTeam;

export const HomeFavoriteMatchup = ({
  favoriteTeam,
  recent,
  upcoming,
}: {
  readonly favoriteTeam: Team;
  readonly recent: readonly Game[];
  readonly upcoming: readonly Game[];
}) => {
  const game = upcoming[0] ?? recent[0];
  const isNext = upcoming[0] !== undefined;
  if (!game) {
    return (
      <Card sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
        <Typography variant="overline" color="var(--team-primary)">
          NEXT GAME
        </Typography>
        <Typography component="h2" variant="h3">
          No matchup available
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          No upcoming game or recent final is available in the bounded team
          schedule.
        </Typography>
        <Button
          component={RouterLink}
          to={`/games?team=${favoriteTeam.id}`}
          sx={{ mt: 2 }}
        >
          View team schedule
        </Button>
      </Card>
    );
  }
  const opponent = gameOpponent(game, favoriteTeam.id);
  const favoriteIsHome = game.homeTeam.id === favoriteTeam.id;
  const favoriteGameTeam = favoriteIsHome ? game.homeTeam : game.awayTeam;
  const favoriteScore = favoriteIsHome ? game.homeScore : game.awayScore;
  const opponentScore = favoriteIsHome ? game.awayScore : game.homeScore;
  const showScore =
    isScoreStatus(game.status) &&
    favoriteScore !== null &&
    opponentScore !== null;
  const venue = [game.venue.name, game.venue.city].filter(Boolean).join(' · ');

  return (
    <Card
      component="section"
      aria-labelledby="home-favorite-matchup"
      sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="overline" color="var(--team-primary)">
              {isNext ? 'NEXT GAME' : 'LAST GAME'}
            </Typography>
            <Typography id="home-favorite-matchup" component="h2" variant="h3">
              {getGameDisplayLabel(game)}
            </Typography>
          </Box>
          <GameStatusChip status={game.status} />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-around' }}
        >
          <Stack
            spacing={0.5}
            sx={{ alignItems: 'center', textAlign: 'center' }}
          >
            <TeamHelmet team={favoriteGameTeam.abbreviation} size="md" />
            <Typography sx={{ fontWeight: 900 }}>
              {favoriteGameTeam.abbreviation}
            </Typography>
            {showScore ? (
              <Typography variant="h3">{favoriteScore}</Typography>
            ) : null}
          </Stack>
          <Chip label={favoriteIsHome ? 'vs.' : 'at'} variant="outlined" />
          <Stack
            spacing={0.5}
            sx={{ alignItems: 'center', textAlign: 'center' }}
          >
            <TeamHelmet team={opponent.abbreviation} size="md" />
            <Typography sx={{ fontWeight: 900 }}>
              {opponent.abbreviation}
            </Typography>
            {showScore ? (
              <Typography variant="h3">{opponentScore}</Typography>
            ) : null}
          </Stack>
        </Stack>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800 }}>
            {formatGameDateTime(game)}
          </Typography>
          {venue ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <LocationOnOutlined
                fontSize="small"
                color="action"
                aria-hidden="true"
              />
              <Typography variant="body2" color="text.secondary">
                {venue}
              </Typography>
            </Stack>
          ) : null}
          {game.broadcastNetwork ? (
            <Typography variant="body2" color="text.secondary">
              Watch on {game.broadcastNetwork}
            </Typography>
          ) : null}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component={RouterLink}
            to={`/games/${game.id}`}
            variant="contained"
            sx={{ flex: 1 }}
          >
            Game Center
          </Button>
          <Button
            component={RouterLink}
            to={`/games?team=${favoriteTeam.id}`}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Team schedule
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export const HomeMatchupSkeleton = () => (
  <Card
    sx={{ height: '100%', p: 3 }}
    aria-busy="true"
    aria-label="Loading favorite team matchup"
  >
    <Stack spacing={2}>
      <Skeleton width="40%" />
      <Skeleton variant="rounded" height={138} />
      <Skeleton variant="rounded" height={42} />
    </Stack>
  </Card>
);
