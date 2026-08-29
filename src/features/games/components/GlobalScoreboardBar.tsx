import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
  const gameCenterMatch = useMatch('/games/:gameId');
  const activeGameId = gameCenterMatch?.params.gameId;

  const scoreboardQuery = useScoreboardGamesQuery();
  const currentUserQuery = useCurrentUserQuery();
  const favoriteTeam = currentUserQuery.data?.favoriteTeam ?? null;

  const games = useMemo(
    () => selectScoreboardGames(scoreboardQuery.data?.games ?? []),
    [scoreboardQuery.data],
  );

  const updateScrollEdges = useCallback((element: HTMLDivElement | null) => {
    if (element === null) return;
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
    const next = {
      left: element.scrollLeft > 2,
      right: element.scrollLeft < maximum - 2,
    };
    setScrollEdges((current) =>
      current.left === next.left && current.right === next.right
        ? current
        : next,
    );
  }, []);

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

  useEffect(() => {
    const update = () => updateScrollEdges(scrollRef.current);
    const frame = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [games, updateScrollEdges]);

  const scrollScoreboard = (direction: -1 | 1) =>
    scrollRef.current?.scrollBy({
      left: direction * CARD_SCROLL_DISTANCE,
      behavior: 'smooth',
    });

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

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 1.5,
          }}
        >
          <Stack
            ref={scrollRef}
            data-testid="scoreboard-scroll-rail"
            direction="row"
            spacing={1.25}
            onScroll={(event) => updateScrollEdges(event.currentTarget)}
            sx={{
              overflowX: 'auto',
              scrollSnapType: 'x proximity',
              scrollPaddingInline: { xs: 44, md: 52 },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              px: { xs: 5.5, md: 6.5 },
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

          {(['left', 'right'] as const).map((edge) => {
            const visible = scrollEdges[edge];
            return (
              <Box
                key={edge}
                aria-hidden="true"
                data-testid={`scoreboard-${edge}-fade`}
                sx={(theme) => ({
                  pointerEvents: 'none',
                  position: 'absolute',
                  insetBlock: 0,
                  [edge]: 0,
                  width: { xs: 58, md: 76 },
                  opacity: visible ? 1 : 0,
                  transition: theme.transitions.create('opacity', {
                    duration: theme.transitions.duration.shortest,
                  }),
                  background: `linear-gradient(to ${edge === 'left' ? 'right' : 'left'}, ${theme.palette.background.paper} 28%, transparent)`,
                })}
              />
            );
          })}

          <IconButton
            size="small"
            aria-label="Scroll scoreboard left"
            disabled={!scrollEdges.left}
            onClick={() => scrollScoreboard(-1)}
            sx={{
              display: 'inline-flex',
              position: 'absolute',
              left: { xs: 4, md: 8 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              opacity: scrollEdges.left ? 1 : 0,
              pointerEvents: scrollEdges.left ? 'auto' : 'none',
              transition: 'opacity 140ms ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Scroll scoreboard right"
            disabled={!scrollEdges.right}
            onClick={() => scrollScoreboard(1)}
            sx={{
              display: 'inline-flex',
              position: 'absolute',
              right: { xs: 4, md: 8 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              opacity: scrollEdges.right ? 1 : 0,
              pointerEvents: scrollEdges.right ? 'auto' : 'none',
              transition: 'opacity 140ms ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronRightRounded />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
