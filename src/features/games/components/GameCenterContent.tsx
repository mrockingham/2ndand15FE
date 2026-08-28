import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';

import {
  ExpandedPlayVisualizerDialog,
  TacticalPlayVisualizer,
} from '@/features/games/components/TacticalPlayVisualizer';
import { FreshnessIndicator } from '@/features/games/components/FreshnessIndicator';
import { GameCenterModule } from '@/features/games/components/GameCenterModule';
import { GameCenterRefreshButton } from '@/features/games/components/GameCenterRefreshButton';
import { GameInfoPanel } from '@/features/games/components/GameInfoPanel';
import { GameLeadersPanel } from '@/features/games/components/GameLeadersPanel';
import { PlayFeed } from '@/features/games/components/PlayFeed';
import { PlayerStatsPanel } from '@/features/games/components/PlayerStatsPanel';
import { PlayerQuickStats } from '@/features/games/components/PlayerQuickStats';
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
  const game = gameQuery.data!;
  const playsQuery = useGamePlaysQuery(game.id, {
    staleTime: getGameCenterStaleTime(game, 'plays'),
    refetchInterval: getPlaysRefetchInterval(game),
  });
  const statsQuery = useGameStatsQuery(game.id, {
    staleTime: getGameCenterStaleTime(game, 'stats'),
    refetchInterval: getStatsRefetchInterval(game),
  });
  const gameMediaQuery = useGameMediaQuery(game.id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const plays = useMemo(() => playsQuery.data?.plays ?? [], [playsQuery.data]);
  const latestPlay = useMemo(
    () =>
      [...plays].sort((left, right) => right.sequence - left.sequence)[0] ??
      null,
    [plays],
  );

  const [selectedPlayId, setSelectedPlayId] = useState<string | null>(null);
  const [replayVersion, setReplayVersion] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [previousPlays, setPreviousPlays] = useState(plays);
  if (plays !== previousPlays) {
    const previousSelectedPlay =
      previousPlays.find((play) => play.id === selectedPlayId) ?? null;
    const resolvedId =
      selectedPlayId === null
        ? null
        : resolveSelectedPlayAfterRefresh(
            plays,
            selectedPlayId,
            previousSelectedPlay,
          );
    setPreviousPlays(plays);
    const nextSelectedId =
      resolvedId !== null && resolvedId === latestPlay?.id ? null : resolvedId;
    if (nextSelectedId !== selectedPlayId) setSelectedPlayId(nextSelectedId);
  }
  const selectedPlay =
    plays.find((play) => play.id === selectedPlayId) ?? latestPlay;
  const replayMode =
    selectedPlayId !== null &&
    selectedPlay !== null &&
    selectedPlay.id !== latestPlay?.id;
  const handleSelectPlay = (playId: string) => {
    setSelectedPlayId(playId === latestPlay?.id ? null : playId);
  };

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
      void playsQuery.refetch();
      void statsQuery.refetch();
      void gameMediaQuery.refetch();
    }
  }, [game.status, playsQuery, statsQuery, gameMediaQuery]);

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
  const stats =
    statsQuery.data?.coverage === 'AVAILABLE' ? statsQuery.data : null;

  const playContent =
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
      <PlayFeed
        plays={plays}
        selectedPlayId={selectedPlay?.id ?? null}
        onSelectPlay={handleSelectPlay}
      />
    );

  return (
    <Stack spacing={2}>
      <GameCenterRefreshButton
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <ScoreboardHero game={game} latestPlay={latestPlay} />
      {isLive ? (
        <FreshnessIndicator
          label={game.status === 'IN_PROGRESS' ? 'LIVE' : 'HALFTIME'}
          updatedAt={oldestUpdatedAt}
          isFetching={isFetchingAny}
          hasError={hasErrorAny}
        />
      ) : null}

      <Box
        data-testid="gamecast-grid"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(250px, 0.9fr) minmax(420px, 1.75fr) minmax(250px, 0.9fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0, order: { xs: 2, lg: 1 } }}>
          <GameCenterModule title="Game Leaders" eyebrow="Top Performers">
            {stats === null ? (
              <Typography color="text.secondary">
                Game leaders will appear when player statistics are available.
              </Typography>
            ) : (
              <GameLeadersPanel
                leaders={stats.gameLeaders}
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
              />
            )}
          </GameCenterModule>
          <GameCenterModule title="Team Stats" id="team-stats">
            <TeamStatsPanel
              awayTeam={game.awayTeam}
              homeTeam={game.homeTeam}
              gameStatus={game.status}
              query={statsQuery}
            />
          </GameCenterModule>
          {stats === null ? null : (
            <GameCenterModule title="Player Stats" eyebrow="Quick Leaders">
              <PlayerQuickStats
                leaders={stats.gameLeaders}
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
              />
            </GameCenterModule>
          )}
        </Stack>

        <Stack spacing={2} sx={{ minWidth: 0, order: { xs: 1, lg: 2 } }}>
          {latestPlay === null ? null : (
            <GameCenterModule title="Play Visualization" eyebrow="On the Field">
              <TacticalPlayVisualizer
                game={game}
                play={selectedPlay ?? latestPlay}
                replayMode={replayMode}
                replayVersion={replayVersion}
                onReplay={() => setReplayVersion((version) => version + 1)}
                onExpand={() => setExpanded(true)}
                onReturnToLive={() => setSelectedPlayId(null)}
              />
            </GameCenterModule>
          )}
          <GameCenterModule title="Play-by-Play" eyebrow="Gamecast">
            {playContent}
          </GameCenterModule>
        </Stack>

        <Stack spacing={2} sx={{ minWidth: 0, order: 3 }}>
          <GameCenterModule title="Featured Video">
            <GameMediaSection game={game} query={gameMediaQuery} compact />
          </GameCenterModule>
          <GameCenterModule title="Game Info">
            <GameInfoPanel game={game} />
          </GameCenterModule>
        </Stack>
      </Box>

      <GameCenterModule title="Player Stats" id="player-stats">
        {stats === null ? (
          <Typography color="text.secondary">
            {statsQuery.isPending
              ? 'Player statistics are loading.'
              : 'Player statistics are not available for this game.'}
          </Typography>
        ) : (
          <PlayerStatsPanel
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
            coverageState={stats.playerStatsCoverageState}
            awayStats={stats.playerStats.away}
            homeStats={stats.playerStats.home}
          />
        )}
      </GameCenterModule>
      {selectedPlay === null ? null : (
        <ExpandedPlayVisualizerDialog
          open={expanded}
          game={game}
          play={selectedPlay}
          plays={plays}
          selectedPlayId={selectedPlay.id}
          replayMode={replayMode}
          replayVersion={replayVersion}
          onClose={() => setExpanded(false)}
          onSelectPlay={handleSelectPlay}
          onReplay={() => setReplayVersion((version) => version + 1)}
          onReturnToLive={() => setSelectedPlayId(null)}
        />
      )}
    </Stack>
  );
};
