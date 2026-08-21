import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useDebouncedValue } from '@/features/players/useDebouncedValue';
import { HistoricalRoster } from '@/features/teamHub/components/HistoricalRoster';
import { getTeamHubErrorMessage } from '@/features/teamHub/errors';
import { useTeamRosterQuery } from '@/features/teamHub/queries';
import { teamHubKeys } from '@/features/teamHub/queryKeys';
import type {
  NormalizedTeamHubUrlState,
  TeamHubOverview,
} from '@/features/teamHub/types';
import { ApiError } from '@/services/api/apiClient';

export const TeamRosterSection = ({
  teamId,
  overview,
  state,
  onChange,
}: {
  readonly teamId: string;
  readonly overview: TeamHubOverview;
  readonly state: NormalizedTeamHubUrlState;
  readonly onChange: (changes: Partial<NormalizedTeamHubUrlState>) => void;
}) => {
  const queryClient = useQueryClient();
  const urlSearch = state.rosterSearch ?? '';
  const [searchEdit, setSearchEdit] = useState<{
    readonly source: string;
    readonly value: string;
  } | null>(null);
  const searchDraft =
    searchEdit?.source === urlSearch ? searchEdit.value : urlSearch;
  const debouncedSearch = useDebouncedValue(searchDraft.trim(), 400);
  const search = debouncedSearch.length >= 2 ? debouncedSearch : undefined;
  const filters = {
    season: state.rosterSeason ?? 0,
    position: state.rosterPosition,
    positionGroup: state.rosterPositionGroup,
    search,
    limit: 25,
  };
  const query = useTeamRosterQuery(
    teamId,
    filters,
    state.rosterSeason !== undefined,
  );
  const rows = query.data?.pages.flatMap((page) => page.roster) ?? [];
  const semantics = query.data?.pages[0]?.semantics;

  useEffect(() => {
    if ((state.rosterSearch ?? '') === (search ?? '')) return;
    onChange({ rosterSearch: search });
  }, [onChange, search, state.rosterSearch]);

  const retry = () => {
    if (
      query.error instanceof ApiError &&
      query.error.code === 'TEAM_ROSTER_INVALID_CURSOR'
    )
      return queryClient.resetQueries({
        queryKey: teamHubKeys.roster(teamId, filters),
        exact: true,
      });
    return query.refetch();
  };

  return (
    <Box component="section" id="roster" aria-labelledby="team-roster-title">
      <Stack spacing={2.5}>
        <Box>
          <Typography id="team-roster-title" component="h2" variant="h3">
            Historical roster
          </Typography>
          <Typography color="text.secondary">
            A roster entry means the player was recorded with this team during
            at least one stored week in the selected season. It does not prove a
            full-season or current-team membership.
          </Typography>
        </Box>
        {state.rosterSeason === undefined ? (
          <Alert severity="info">
            No historical roster seasons are available for this team. No 2026
            roster is inferred.
          </Alert>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              }}
            >
              <TextField
                select
                label="Roster season"
                value={state.rosterSeason}
                onChange={(event) =>
                  onChange({ rosterSeason: Number(event.target.value) })
                }
              >
                {overview.historicalData.rosterSeasons.map((season) => (
                  <MenuItem key={season} value={season}>
                    {season}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Search roster"
                value={searchDraft}
                onChange={(event) =>
                  setSearchEdit({
                    source: urlSearch,
                    value: event.target.value,
                  })
                }
                helperText="Search starts at two characters after a short pause."
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
              <TextField
                select
                label="Historical position"
                value={state.rosterPosition ?? ''}
                onChange={(event) =>
                  onChange({ rosterPosition: event.target.value || undefined })
                }
              >
                <MenuItem value="">All Positions</MenuItem>
                {overview.historicalData.positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Historical position group"
                value={state.rosterPositionGroup ?? ''}
                onChange={(event) =>
                  onChange({
                    rosterPositionGroup: event.target.value || undefined,
                  })
                }
              >
                <MenuItem value="">All Position Groups</MenuItem>
                {overview.historicalData.positionGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {query.isPending ? (
              <Paper
                aria-busy="true"
                aria-label="Loading historical roster"
                sx={{ minHeight: 220, p: 3 }}
              >
                <Typography role="status">
                  Loading historical roster…
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {Array.from({ length: 4 }, (_value, index) => (
                    <Skeleton key={index} variant="rounded" height={34} />
                  ))}
                </Stack>
              </Paper>
            ) : null}
            {query.isError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={() => void retry()}>
                    {query.error instanceof ApiError &&
                    query.error.code === 'TEAM_ROSTER_INVALID_CURSOR'
                      ? 'Start over'
                      : 'Retry'}
                  </Button>
                }
              >
                {getTeamHubErrorMessage(query.error)}
              </Alert>
            ) : null}
            {!query.isPending && !query.isError && rows.length === 0 ? (
              <Alert severity="info">
                No historical roster entries match these filters.
              </Alert>
            ) : null}
            {rows.length ? (
              <HistoricalRoster rows={rows} season={state.rosterSeason} />
            ) : null}
            {semantics ? (
              <Box component="details">
                <Typography
                  component="summary"
                  sx={{ cursor: 'pointer', fontWeight: 700 }}
                >
                  Historical roster field meanings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {semantics.membership}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {semantics.latestKnownTeam}
                </Typography>
              </Box>
            ) : null}
            {query.hasNextPage ? (
              <Button
                variant="outlined"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
                sx={{ alignSelf: 'center' }}
              >
                {query.isFetchingNextPage
                  ? 'Loading…'
                  : 'Load more roster players'}
              </Button>
            ) : null}
          </>
        )}
      </Stack>
    </Box>
  );
};
