import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { GameScheduleList } from '@/features/games/components/GameScheduleList';
import { getPublicGameErrorMessage } from '@/features/games/errors';
import { seasonTypeLabel } from '@/features/games/presentation';
import { useGamesQuery } from '@/features/games/queries';
import type { Game, SeasonType } from '@/features/games/types';
import { compareGames, isGameUpcoming } from '@/features/games/utils/dateTime';
import { useTeamsQuery } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';

const CURRENT_IMPORTED_SEASON = 2026;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const weekMaximum: Readonly<Record<'PRE' | 'REG', number>> = {
  PRE: 3,
  REG: 18,
};

const readSeasonType = (value: string | null): 'PRE' | 'REG' | null =>
  value === 'PRE' || value === 'REG' ? value : null;

const readSeason = (value: string | null) => {
  if (value === null || !/^\d{4}$/.test(value)) return undefined;
  const season = Number(value);
  return season >= 1920 && season <= 2100 ? season : undefined;
};

const readWeek = (value: string | null, seasonType: 'PRE' | 'REG' | null) => {
  if (seasonType === null || value === null || !/^\d+$/.test(value))
    return null;
  const week = Number(value);
  return week >= 1 && week <= weekMaximum[seasonType] ? week : null;
};

const chooseInitialWeek = (games: readonly Game[]) => {
  const active = games.find(
    (game) =>
      game.week !== null &&
      ['PREGAME', 'IN_PROGRESS', 'HALFTIME'].includes(game.status),
  );
  if (active !== undefined) return active;
  const upcoming = games
    .filter((game) => game.week !== null && isGameUpcoming(game))
    .sort(compareGames)[0];
  if (upcoming !== undefined) return upcoming;
  const completed = games
    .filter((game) => game.week !== null && game.status === 'FINAL')
    .sort(compareGames)
    .at(-1);
  return completed;
};

export const GamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = readSeasonType(searchParams.get('type'));
  const requestedWeek = readWeek(searchParams.get('week'), requestedType);
  const needsInitialWeek = requestedType === null || requestedWeek === null;
  const bootstrapQuery = useGamesQuery({ limit: 100 }, needsInitialWeek);
  const teamsQuery = useTeamsQuery();
  const currentUserQuery = useCurrentUserQuery();

  useEffect(() => {
    if (!needsInitialWeek || bootstrapQuery.isPending) return;
    const nearbyGames =
      bootstrapQuery.data?.pages.flatMap((page) => page.games) ?? [];
    const chosen = chooseInitialWeek(nearbyGames);
    const next = new URLSearchParams(searchParams);
    const chosenType =
      chosen?.seasonType === 'PRE' || chosen?.seasonType === 'REG'
        ? chosen.seasonType
        : 'REG';
    const type = requestedType ?? chosenType;
    next.set('type', type);
    next.set(
      'week',
      String(
        requestedType === null && chosenType === chosen?.seasonType
          ? (chosen?.week ?? 1)
          : 1,
      ),
    );
    setSearchParams(next, { replace: true });
  }, [
    bootstrapQuery.data,
    bootstrapQuery.isPending,
    needsInitialWeek,
    requestedType,
    searchParams,
    setSearchParams,
  ]);

  const selectedType = requestedType;
  const selectedWeek = requestedWeek;
  const season = readSeason(searchParams.get('season'));
  const rawTeamId = searchParams.get('team');
  const teamId =
    rawTeamId !== null && uuidPattern.test(rawTeamId) ? rawTeamId : undefined;
  const scheduleQuery = useGamesQuery(
    {
      season,
      seasonType: selectedType ?? undefined,
      week: selectedWeek ?? undefined,
      teamId,
      limit: 100,
    },
    selectedType !== null && selectedWeek !== null,
  );
  const games = scheduleQuery.data?.pages.flatMap((page) => page.games) ?? [];
  const favoriteTeam = currentUserQuery.data?.favoriteTeam ?? null;
  const selectedTeam = teamsQuery.data?.find((team) => team.id === teamId);

  const updateFilters = (updates: Readonly<Record<string, string | null>>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const emptyMessage = () => {
    if (
      teamId !== undefined &&
      selectedType === 'REG' &&
      (season === undefined || season === CURRENT_IMPORTED_SEASON)
    ) {
      return {
        title: 'Bye week',
        detail: `${selectedTeam?.fullName ?? 'This team'} has no game in this valid 2026 regular-season week.`,
      };
    }
    if (selectedType === 'PRE')
      return {
        title: 'No preseason games',
        detail: 'No preseason games match these filters.',
      };
    return {
      title: 'No games for these filters',
      detail: 'Try another week or choose All teams.',
    };
  };

  if (needsInitialWeek && bootstrapQuery.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: '55vh', placeItems: 'center' }}>
        <CircularProgress aria-label="Choosing the current schedule week" />
      </Box>
    );
  }

  const maxWeek = selectedType === null ? 1 : weekMaximum[selectedType];
  const empty = emptyMessage();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={3.5}>
        <Box>
          <Typography variant="overline" color="primary.light">
            {season ?? CURRENT_IMPORTED_SEASON} NFL SCHEDULE
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 0.75 }}>
            Games
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
            Browse verified-source preseason and regular-season matchups.
            Kickoff times use your local timezone; officially unannounced times
            stay marked Time TBD.
          </Typography>
        </Box>

        <Paper
          component="section"
          aria-label="Schedule filters"
          sx={{ p: { xs: 2, sm: 2.5 } }}
        >
          <Stack spacing={2}>
            {teamsQuery.isError ? (
              <Alert severity="warning">
                Team choices are unavailable. League-wide week browsing still
                works.
              </Alert>
            ) : null}
            <ToggleButtonGroup
              exclusive
              value={selectedType}
              onChange={(_, value: SeasonType | null) => {
                if (value === 'PRE' || value === 'REG')
                  updateFilters({ type: value, week: '1' });
              }}
              aria-label="Season type"
              fullWidth
            >
              <ToggleButton value="PRE">Preseason</ToggleButton>
              <ToggleButton value="REG">Regular Season</ToggleButton>
            </ToggleButtonGroup>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { md: 'center' } }}
            >
              <Button
                startIcon={<ArrowBackRounded />}
                disabled={selectedWeek === null || selectedWeek <= 1}
                onClick={() =>
                  updateFilters({ week: String((selectedWeek ?? 2) - 1) })
                }
                aria-label="Previous week"
              >
                Previous
              </Button>
              <FormControl sx={{ minWidth: { md: 220 } }}>
                <InputLabel id="week-selector-label">Week</InputLabel>
                <Select
                  labelId="week-selector-label"
                  label="Week"
                  value={selectedWeek ?? ''}
                  onChange={(event) =>
                    updateFilters({ week: String(event.target.value) })
                  }
                >
                  {Array.from({ length: maxWeek }, (_, index) => index + 1).map(
                    (week) => (
                      <MenuItem key={week} value={week}>
                        {selectedType === 'PRE' ? 'Preseason ' : ''}Week {week}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
              <Button
                endIcon={<ArrowForwardRounded />}
                disabled={selectedWeek === null || selectedWeek >= maxWeek}
                onClick={() =>
                  updateFilters({ week: String((selectedWeek ?? 0) + 1) })
                }
                aria-label="Next week"
              >
                Next
              </Button>
              <FormControl sx={{ minWidth: { md: 280 }, flex: 1 }}>
                <InputLabel id="team-selector-label">Team</InputLabel>
                <Select
                  labelId="team-selector-label"
                  label="Team"
                  value={teamId ?? ''}
                  onChange={(event) =>
                    updateFilters({ team: event.target.value || null })
                  }
                  disabled={teamsQuery.isPending}
                >
                  <MenuItem value="">All teams</MenuItem>
                  {teamsQuery.data?.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.abbreviation} — {team.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {favoriteTeam === null ? null : (
                <Button
                  variant={
                    teamId === favoriteTeam.id ? 'contained' : 'outlined'
                  }
                  onClick={() => updateFilters({ team: favoriteTeam.id })}
                >
                  My Team · {favoriteTeam.abbreviation}
                </Button>
              )}
              <Button
                startIcon={<RefreshRounded />}
                onClick={() => void scheduleQuery.refetch()}
                disabled={scheduleQuery.isFetching}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box>
          <Typography variant="h3" component="h2">
            {selectedType === null ? 'Schedule' : seasonTypeLabel[selectedType]}
            {selectedWeek === null ? '' : ` · Week ${selectedWeek}`}
          </Typography>
          {selectedTeam === undefined ? null : (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Filtered to {selectedTeam.fullName}
            </Typography>
          )}
        </Box>

        {scheduleQuery.isPending ? (
          <Box sx={{ display: 'grid', minHeight: 260, placeItems: 'center' }}>
            <CircularProgress aria-label="Loading schedule" />
          </Box>
        ) : scheduleQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button onClick={() => void scheduleQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {getPublicGameErrorMessage(scheduleQuery.error)}
          </Alert>
        ) : games.length === 0 ? (
          <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Typography variant="h4" component="h2">
              {empty.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {empty.detail}
            </Typography>
          </Paper>
        ) : (
          <GameScheduleList games={games} />
        )}

        {scheduleQuery.hasNextPage ? (
          <Button
            variant="outlined"
            onClick={() => void scheduleQuery.fetchNextPage()}
            disabled={scheduleQuery.isFetchingNextPage}
            sx={{ alignSelf: 'center' }}
          >
            {scheduleQuery.isFetchingNextPage ? 'Loading…' : 'Load more games'}
          </Button>
        ) : null}

        {currentUserQuery.data !== undefined && favoriteTeam === null ? (
          <Alert
            severity="info"
            action={
              <Button component={RouterLink} to="/choose-team">
                Choose team
              </Button>
            }
          >
            Choose a favorite team to unlock the My Team shortcut and next-game
            card.
          </Alert>
        ) : null}
      </Stack>
    </Container>
  );
};
