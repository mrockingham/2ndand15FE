import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { CurrentSituation } from '@/features/games/components/CurrentSituation';
import { FieldProgress } from '@/features/games/components/FieldProgress';
import { FreshnessIndicator } from '@/features/games/components/FreshnessIndicator';
import { GameCenterRefreshButton } from '@/features/games/components/GameCenterRefreshButton';
import { PlayFeed } from '@/features/games/components/PlayFeed';
import { PlayerStatsPanel } from '@/features/games/components/PlayerStatsPanel';
import { ScoreboardHero } from '@/features/games/components/ScoreboardHero';
import { TeamStatsPanel } from '@/features/games/components/TeamStatsPanel';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import {
  getGameCenterStaleTime,
  getPlaysRefetchInterval,
  getStatsRefetchInterval,
} from '@/features/games/gameCenterPolling';
import { resolveSelectedPlayAfterRefresh } from '@/features/games/gameCenterSelection';
import { isFinalizedGameStatus } from '@/features/games/presentation';
import { useGamePlaysQuery, useGameStatsQuery } from '@/features/games/queries';
import type { Game, GameStatus } from '@/features/games/types';
import { GameMediaSection } from '@/features/gameMedia/components/GameMediaSection';
import { useGameMediaQuery } from '@/features/gameMedia/queries';

export const GameCenterContent = ({
  gameQuery,
}: {
  readonly gameQuery: UseQueryResult<Game, unknown>;
}) => {
  // GameDetailPage only renders this component once gameQuery.data is
  // populated; a later background refetch failure keeps that data intact.
  const game = gameQuery.data!;

  const playsStaleTime = getGameCenterStaleTime(game, 'plays');
  const statsStaleTime = getGameCenterStaleTime(game, 'stats');
  const playsRefetchInterval = getPlaysRefetchInterval(game);
  const statsRefetchInterval = getStatsRefetchInterval(game);

  const playsQuery = useGamePlaysQuery(game.id, {
    staleTime: playsStaleTime,
    refetchInterval: playsRefetchInterval,
  });
  const statsQuery = useGameStatsQuery(game.id, {
    staleTime: statsStaleTime,
    refetchInterval: statsRefetchInterval,
  });
  const gameMediaQuery = useGameMediaQuery(game.id);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const plays = useMemo(() => playsQuery.data?.plays ?? [], [playsQuery.data]);

  // Resolve the effective selection whenever the plays list changes,
  // comparing against the previous list/selection captured in state (the
  // React-documented way to react to a changed value during render without
  // an effect or a ref read during render).
  const [selectedPlayId, setSelectedPlayId] = useState<string | null>(null);
  const [previousPlays, setPreviousPlays] = useState(plays);
  if (plays !== previousPlays) {
    const previousSelectedPlay =
      previousPlays.find((play) => play.id === selectedPlayId) ?? null;
    const resolvedId = resolveSelectedPlayAfterRefresh(
      plays,
      selectedPlayId,
      previousSelectedPlay,
    );
    setPreviousPlays(plays);
    if (resolvedId !== selectedPlayId) {
      setSelectedPlayId(resolvedId);
    }
  }
  const selectedPlay = plays.find((play) => play.id === selectedPlayId) ?? null;

  // Fires exactly once on the LIVE -> FINAL transition: the game record
  // itself is already the fresh FINAL data that triggered this effect, so
  // only plays/stats need an explicit one-time refetch to pick up the
  // backend's authoritative snapshot replacement. Interval polling for all
  // three queries already stops on its own once the status is finalized.
  const previousStatusRef = useRef<GameStatus | null>(null);
  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = game.status;
    if (
      previousStatus !== null &&
      previousStatus !== game.status &&
      !isFinalizedGameStatus(previousStatus) &&
      isFinalizedGameStatus(game.status)
    ) {
      playsQuery.refetch();
      statsQuery.refetch();
      gameMediaQuery.refetch();
    }
  }, [game.status, playsQuery, statsQuery, gameMediaQuery]);

  const playsUnavailable = playsQuery.isSuccess && plays.length === 0;
  const statsUnavailable =
    statsQuery.isSuccess && statsQuery.data.coverage === 'UNAVAILABLE';
  const showPlaysTab = !playsUnavailable;
  const showStatsTab = !statsUnavailable;

  const requestedSection = searchParams.get('section');
  const activeSection =
    showPlaysTab && showStatsTab
      ? requestedSection === 'stats'
        ? 'stats'
        : 'plays'
      : showPlaysTab
        ? 'plays'
        : showStatsTab
          ? 'stats'
          : 'overview';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        gameQuery.refetch(),
        playsQuery.refetch(),
        statsQuery.refetch(),
        gameMediaQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLive = game.status === 'IN_PROGRESS' || game.status === 'HALFTIME';
  const freshnessTimestamps = [
    gameQuery.dataUpdatedAt,
    playsQuery.dataUpdatedAt,
    statsQuery.dataUpdatedAt,
  ].filter((timestamp) => timestamp > 0);
  const oldestUpdatedAt =
    freshnessTimestamps.length > 0 ? Math.min(...freshnessTimestamps) : null;
  const isFetchingAny =
    gameQuery.isFetching || playsQuery.isFetching || statsQuery.isFetching;
  const hasErrorAny =
    gameQuery.isError || playsQuery.isError || statsQuery.isError;

  return (
    <Card
      sx={{ p: { xs: 2.5, sm: 4 }, borderColor: 'appSurfaces.borderStrong' }}
    >
      <Stack spacing={3}>
        <GameCenterRefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <ScoreboardHero game={game} />
        {isLive ? (
          <FreshnessIndicator
            label={game.status === 'IN_PROGRESS' ? 'LIVE' : 'HALFTIME'}
            updatedAt={oldestUpdatedAt}
            isFetching={isFetchingAny}
            hasError={hasErrorAny}
          />
        ) : null}
        <GameMediaSection game={game} query={gameMediaQuery} />
        <Divider />

        {activeSection === 'overview' ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: 'center', py: 2 }}
          >
            {game.status === 'SCHEDULED' || game.status === 'PREGAME'
              ? 'Game data will appear once action begins.'
              : 'No play-by-play or team statistics are available for this game yet.'}
          </Typography>
        ) : (
          <>
            {showPlaysTab && showStatsTab ? (
              <Tabs
                value={activeSection}
                onChange={(_event, next: 'plays' | 'stats') =>
                  setSearchParams(
                    (previous) => {
                      const updated = new URLSearchParams(previous);
                      updated.set('section', next);
                      return updated;
                    },
                    { replace: true },
                  )
                }
                aria-label="Game Center sections"
              >
                <Tab value="plays" label="Plays" />
                <Tab value="stats" label="Team Stats" />
              </Tabs>
            ) : null}

            {activeSection === 'plays' ? (
              playsQuery.data === undefined ? (
                playsQuery.isPending ? (
                  <Stack sx={{ alignItems: 'center', py: 4 }}>
                    <CircularProgress aria-label="Loading plays" size={28} />
                  </Stack>
                ) : (
                  <Alert
                    severity="error"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => playsQuery.refetch()}
                      >
                        Retry
                      </Button>
                    }
                  >
                    {getPublicGameErrorMessage(playsQuery.error)}
                  </Alert>
                )
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
                    alignItems: 'start',
                  }}
                >
                  <Stack spacing={2}>
                    <CurrentSituation play={selectedPlay} />
                    <FieldProgress play={selectedPlay} />
                  </Stack>
                  <PlayFeed
                    plays={plays}
                    selectedPlayId={selectedPlayId}
                    onSelectPlay={setSelectedPlayId}
                  />
                </Box>
              )
            ) : null}

            {activeSection === 'stats' ? (
              <Stack spacing={4}>
                <TeamStatsPanel
                  awayTeam={game.awayTeam}
                  homeTeam={game.homeTeam}
                  gameStatus={game.status}
                  query={statsQuery}
                />
                {statsQuery.data !== undefined &&
                statsQuery.data.coverage === 'AVAILABLE' ? (
                  <PlayerStatsPanel
                    awayTeam={game.awayTeam}
                    homeTeam={game.homeTeam}
                    playerStatsAvailable={statsQuery.data.playerStatsAvailable}
                    awayStats={statsQuery.data.playerStats.away}
                    homeStats={statsQuery.data.playerStats.home}
                  />
                ) : null}
              </Stack>
            ) : null}
          </>
        )}
      </Stack>
    </Card>
  );
};
