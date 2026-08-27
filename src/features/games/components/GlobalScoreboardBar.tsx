import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { Link as RouterLink, useMatch } from 'react-router-dom';

import { MiniGameCard } from '@/features/games/components/MiniGameCard';
import { useScoreboardGamesQuery } from '@/features/games/queries';
import { selectScoreboardGames } from '@/features/games/utils/scoreboard';
import { useCurrentUserQuery } from '@/features/users/queries';

const CARD_SCROLL_DISTANCE = 320;

const ScoreboardSkeleton = () => (
  <Stack direction="row" spacing={1.5} sx={{ overflow: 'hidden', py: 1.5 }}>
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton
        key={index}
        variant="rounded"
        width={156}
        height={76}
        sx={{ flexShrink: 0 }}
      />
    ))}
  </Stack>
);

export const GlobalScoreboardBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const favoriteCardRef = useRef<HTMLElement>(null);
  const gameCenterMatch = useMatch('/games/:gameId');
  const activeGameId = gameCenterMatch?.params.gameId;

  const scoreboardQuery = useScoreboardGamesQuery();
  const currentUserQuery = useCurrentUserQuery();
  const favoriteTeam = currentUserQuery.data?.favoriteTeam ?? null;

  const games = useMemo(
    () => selectScoreboardGames(scoreboardQuery.data?.games ?? []),
    [scoreboardQuery.data],
  );

  const weekLabel = useMemo(() => {
    const weeks = games
      .filter((game) => game.seasonType !== 'PRE' && game.week !== null)
      .map((game) => game.week as number);
    if (weeks.length === 0) return null;
    const counts = new Map<number, number>();
    for (const week of weeks) counts.set(week, (counts.get(week) ?? 0) + 1);
    const [topWeek] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return topWeek;
  }, [games]);

  useEffect(() => {
    favoriteCardRef.current?.scrollIntoView?.({
      block: 'nearest',
      inline: 'center',
    });
  }, [favoriteTeam?.id, games]);

  if (scoreboardQuery.isError) return null;

  if (scoreboardQuery.isPending) {
    return (
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'appSurfaces.borderStrong',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ maxWidth: 'xl', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <ScoreboardSkeleton />
        </Box>
      </Box>
    );
  }

  if (games.length === 0) {
    return (
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'appSurfaces.borderStrong',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            maxWidth: 'xl',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            py: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Typography
            component={RouterLink}
            to="/games"
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            View Schedule →
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      aria-label="NFL scoreboard"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'appSurfaces.borderStrong',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          maxWidth: 'xl',
          mx: 'auto',
          px: { xs: 1, sm: 3 },
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          component={RouterLink}
          to="/games"
          variant="body2"
          sx={{
            flexShrink: 0,
            fontWeight: 800,
            color: 'text.primary',
            textDecoration: 'none',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {weekLabel === null ? 'Full Schedule →' : `Week ${weekLabel} →`}
        </Typography>

        <IconButton
          size="small"
          aria-label="Scroll scoreboard left"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: -CARD_SCROLL_DISTANCE,
              behavior: 'smooth',
            })
          }
          sx={{ display: { xs: 'none', md: 'inline-flex' }, flexShrink: 0 }}
        >
          <ChevronLeftRounded />
        </IconButton>

        <Stack
          ref={scrollRef}
          direction="row"
          spacing={1.25}
          sx={{
            overflowX: 'auto',
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            flex: 1,
            minWidth: 0,
          }}
        >
          {games.map((game) => {
            const isFavoriteTeamGame =
              favoriteTeam !== null &&
              (game.homeTeam.id === favoriteTeam.id ||
                game.awayTeam.id === favoriteTeam.id);
            return (
              <Box
                key={game.id}
                ref={isFavoriteTeamGame ? favoriteCardRef : undefined}
                sx={{ display: 'flex' }}
              >
                <MiniGameCard
                  game={game}
                  isFavoriteTeamGame={isFavoriteTeamGame}
                  isActive={game.id === activeGameId}
                />
              </Box>
            );
          })}
        </Stack>

        <IconButton
          size="small"
          aria-label="Scroll scoreboard right"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: CARD_SCROLL_DISTANCE,
              behavior: 'smooth',
            })
          }
          sx={{ display: { xs: 'none', md: 'inline-flex' }, flexShrink: 0 }}
        >
          <ChevronRightRounded />
        </IconButton>
      </Box>
    </Box>
  );
};
