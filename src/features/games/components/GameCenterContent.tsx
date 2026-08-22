import { useMemo, useState } from 'react';
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
import { useSearchParams } from 'react-router-dom';

import { CurrentSituation } from '@/features/games/components/CurrentSituation';
import { FieldProgress } from '@/features/games/components/FieldProgress';
import { GameCenterRefreshButton } from '@/features/games/components/GameCenterRefreshButton';
import { PlayFeed } from '@/features/games/components/PlayFeed';
import { ScoreboardHero } from '@/features/games/components/ScoreboardHero';
import { TeamStatsPanel } from '@/features/games/components/TeamStatsPanel';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import { isFinalizedGameStatus } from '@/features/games/presentation';
import { useGamePlaysQuery, useGameStatsQuery } from '@/features/games/queries';
import type { Game } from '@/features/games/types';

const FINALIZED_STALE_TIME = 24 * 60 * 60_000;
const LIVE_STALE_TIME = 5 * 60_000;

const latestPlayWithFieldPosition = <
  T extends {
    readonly sequence: number;
    readonly start: { readonly yardLine: number | null };
    readonly end: { readonly yardLine: number | null };
  },
>(
  plays: readonly T[],
) =>
  [...plays]
    .sort((left, right) => right.sequence - left.sequence)
    .find(
      (play) => play.start.yardLine !== null || play.end.yardLine !== null,
    ) ?? null;

export const GameCenterContent = ({
  game,
  onRefreshGame,
}: {
  readonly game: Game;
  readonly onRefreshGame: () => Promise<unknown>;
}) => {
  const staleTime = isFinalizedGameStatus(game.status)
    ? FINALIZED_STALE_TIME
    : LIVE_STALE_TIME;
  const playsQuery = useGamePlaysQuery(game.id, { staleTime });
  const statsQuery = useGameStatsQuery(game.id, { staleTime });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [explicitSelectedPlayId, setExplicitSelectedPlayId] = useState<
    string | null
  >(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const plays = useMemo(() => playsQuery.data?.plays ?? [], [playsQuery.data]);

  const selectedPlayId = useMemo(() => {
    if (
      explicitSelectedPlayId !== null &&
      plays.some((play) => play.id === explicitSelectedPlayId)
    ) {
      return explicitSelectedPlayId;
    }
    return latestPlayWithFieldPosition(plays)?.id ?? null;
  }, [plays, explicitSelectedPlayId]);

  const selectedPlay = plays.find((play) => play.id === selectedPlayId) ?? null;

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
        onRefreshGame(),
        playsQuery.refetch(),
        statsQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

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
              playsQuery.isPending ? (
                <Stack sx={{ alignItems: 'center', py: 4 }}>
                  <CircularProgress aria-label="Loading plays" size={28} />
                </Stack>
              ) : playsQuery.isError ? (
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
                    onSelectPlay={setExplicitSelectedPlayId}
                  />
                </Box>
              )
            ) : null}

            {activeSection === 'stats' ? (
              <TeamStatsPanel
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
                gameStatus={game.status}
                query={statsQuery}
              />
            ) : null}
          </>
        )}
      </Stack>
    </Card>
  );
};
