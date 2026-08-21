import { Alert, Box, Chip, Stack, Typography } from '@mui/material';

import { GameCard } from '@/features/games/components/GameCard';
import type { Game } from '@/features/games/types';
import { teamGameResult } from '@/features/teamHub/presentation';

const GameGrid = ({
  games,
  teamId,
  recent,
}: {
  readonly games: readonly Game[];
  readonly teamId: string;
  readonly recent: boolean;
}) => (
  <Box
    sx={{
      display: 'grid',
      gap: 1.5,
      gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
    }}
  >
    {games.map((game) => {
      const result = recent ? teamGameResult(game, teamId) : null;
      return (
        <Stack key={game.id} spacing={0.75}>
          {result ? (
            <Chip
              label={`${result} · completed score`}
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          ) : null}
          <GameCard game={game} />
        </Stack>
      );
    })}
  </Box>
);

export const TeamScheduleSection = ({
  teamId,
  season,
  upcoming,
  recent,
}: {
  readonly teamId: string;
  readonly season: number;
  readonly upcoming: readonly Game[];
  readonly recent: readonly Game[];
}) => (
  <Box component="section" aria-labelledby="team-schedule-title">
    <Stack spacing={3}>
      <Box>
        <Typography id="team-schedule-title" component="h2" variant="h3">
          {season} schedule snapshot
        </Typography>
        <Typography color="text.secondary">
          Stored upcoming games and completed results in backend order. No
          season record is calculated.
        </Typography>
      </Box>
      <Box>
        <Typography component="h3" variant="h4" sx={{ mb: 1.5 }}>
          Upcoming games
        </Typography>
        {upcoming.length ? (
          <GameGrid games={upcoming} teamId={teamId} recent={false} />
        ) : (
          <Alert severity="info">No upcoming games are currently stored.</Alert>
        )}
      </Box>
      <Box>
        <Typography component="h3" variant="h4" sx={{ mb: 1.5 }}>
          Recent completed games
        </Typography>
        {recent.length ? (
          <GameGrid games={recent} teamId={teamId} recent />
        ) : (
          <Alert severity="info">
            No recent completed games are currently stored.
          </Alert>
        )}
      </Box>
    </Stack>
  </Box>
);
