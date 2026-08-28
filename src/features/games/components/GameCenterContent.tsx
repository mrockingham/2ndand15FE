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

import { CurrentSituation } from '@/features/games/components/CurrentSituation';
import { FieldProgress } from '@/features/games/components/FieldProgress';
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
    if (resolvedId !== selectedPlayId) setSelectedPlayId(resolvedId);
  }
  const selectedPlay =
    plays.find((play) => play.id === selectedPlayId) ?? latestPlay;

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
        selectedPlayId={selectedPlayId}
        onSelectPlay={setSelectedPlayId}
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
            <GameCenterModule title="Live Situation" eyebrow="On the Field">
              <Stack spacing={1.5}>
                <CurrentSituation play={selectedPlay} />
                <FieldProgress play={selectedPlay} />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Latest Play
                  </Typography>
                  <Typography sx={{ fontWeight: 750 }}>
                    {latestPlay.description}
                  </Typography>
                </Box>
              </Stack>
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
    </Stack>
  );
};
