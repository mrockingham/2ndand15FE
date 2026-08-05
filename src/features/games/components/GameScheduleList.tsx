import { Box, Stack, Typography } from '@mui/material';

import { GameCard } from '@/features/games/components/GameCard';
import type { Game } from '@/features/games/types';
import {
  compareGames,
  formatGameDate,
  gameDayKey,
  TIME_TBD,
} from '@/features/games/utils/dateTime';

interface StatusSection {
  readonly title: string;
  readonly games: readonly Game[];
}

const DateGroups = ({ games }: { readonly games: readonly Game[] }) => {
  const known = new Map<string, Game[]>();
  const tbd: Game[] = [];
  for (const game of [...games].sort(compareGames)) {
    const key = gameDayKey(game.startTime);
    if (key === null) {
      tbd.push(game);
    } else {
      const group = known.get(key) ?? [];
      group.push(game);
      known.set(key, group);
    }
  }

  return (
    <Stack spacing={3}>
      {[...known.entries()].map(([key, group]) => (
        <Box component="section" key={key} aria-labelledby={`day-${key}`}>
          <Typography
            id={`day-${key}`}
            variant="h5"
            component="h3"
            sx={{ mb: 1.5 }}
          >
            {formatGameDate(group[0]?.startTime ?? null)}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            {group.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Box>
        </Box>
      ))}
      {tbd.length === 0 ? null : (
        <Box component="section" aria-labelledby="time-tbd-heading">
          <Typography
            id="time-tbd-heading"
            variant="h5"
            component="h3"
            sx={{ mb: 0.5 }}
          >
            {TIME_TBD}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            These games are confirmed for this week; the NFL has not announced a
            kickoff time.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            {tbd.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export const GameScheduleList = ({
  games,
}: {
  readonly games: readonly Game[];
}) => {
  const sections: readonly StatusSection[] = [
    {
      title: 'Upcoming and active games',
      games: games.filter((game) =>
        ['SCHEDULED', 'PREGAME', 'IN_PROGRESS', 'HALFTIME'].includes(
          game.status,
        ),
      ),
    },
    {
      title: 'Completed games',
      games: games.filter((game) => game.status === 'FINAL'),
    },
    {
      title: 'Schedule exceptions',
      games: games.filter((game) =>
        ['POSTPONED', 'CANCELED', 'SUSPENDED'].includes(game.status),
      ),
    },
  ];

  return (
    <Stack spacing={4}>
      {sections
        .filter((section) => section.games.length > 0)
        .map((section) => (
          <Box component="section" key={section.title}>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              {section.title}
            </Typography>
            <DateGroups games={section.games} />
          </Box>
        ))}
    </Stack>
  );
};
