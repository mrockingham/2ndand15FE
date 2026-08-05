import CompareArrowsRounded from '@mui/icons-material/CompareArrowsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { PlayerAttribution } from '@/features/players/components/PlayerAttribution';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { PlayerCard } from '@/features/players/components/PlayerCard';
import { getPlayerErrorMessage } from '@/features/players/errors';
import { parsePlayerSeason } from '@/features/players/presentation';
import { usePlayersQuery } from '@/features/players/queries';
import { useDebouncedValue } from '@/features/players/useDebouncedValue';
import { useTeamsQuery } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';

const seasons = [2025, 2024, 2023, 2022, 2021, 2020] as const;

export const PlayersPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const urlSearch = parameters.get('search') ?? '';
  const urlPosition = parameters.get('position') ?? '';
  const [searchEdit, setSearchEdit] = useState<{
    readonly source: string;
    readonly value: string;
  } | null>(null);
  const [positionEdit, setPositionEdit] = useState<{
    readonly source: string;
    readonly value: string;
  } | null>(null);
  const searchDraft =
    searchEdit?.source === urlSearch ? searchEdit.value : urlSearch;
  const positionDraft =
    positionEdit?.source === urlPosition ? positionEdit.value : urlPosition;
  const debouncedSearch = useDebouncedValue(searchDraft.trim(), 400);
  const search = debouncedSearch.length >= 2 ? debouncedSearch : undefined;
  const teamId = parameters.get('teamId') || undefined;
  const position =
    parameters.get('position')?.trim().toUpperCase() || undefined;
  const season = parsePlayerSeason(parameters.get('season'));
  const teams = useTeamsQuery();
  const favorite = useCurrentUserQuery().data?.favoriteTeam ?? null;
  const query = usePlayersQuery({
    limit: 24,
    search,
    teamId,
    position,
    season,
  });
  const players = query.data?.pages.flatMap((page) => page.players) ?? [];
  const attribution = query.data?.pages[0]?.attribution;
  const selectedTeamId = teams.data?.some((team) => team.id === teamId)
    ? teamId
    : '';

  useEffect(() => {
    const current = parameters.get('search') ?? '';
    const nextValue = debouncedSearch.length >= 2 ? debouncedSearch : '';
    if (current === nextValue) return;
    const next = new URLSearchParams(parameters);
    if (nextValue) next.set('search', nextValue);
    else next.delete('search');
    setParameters(next, { replace: true });
  }, [debouncedSearch, parameters, setParameters]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    setParameters(next);
  };
  const applyPosition = (event: FormEvent) => {
    event.preventDefault();
    update('position', positionDraft.trim().toUpperCase());
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { md: 'flex-start' },
          }}
        >
          <Box>
            <Typography variant="overline" color="primary.light">
              HISTORICAL PLAYER DATA
            </Typography>
            <Typography component="h1" variant="h2">
              Players
            </Typography>
            <Typography color="text.secondary">
              Find NFL players and explore locally stored 2020–2025 profiles and
              statistics.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/players/compare"
            variant="contained"
            startIcon={<CompareArrowsRounded />}
          >
            Compare players
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Search players"
              value={searchDraft}
              onChange={(event) =>
                setSearchEdit({ source: urlSearch, value: event.target.value })
              }
              helperText="Search begins at two characters after a short pause."
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRounded color="action" sx={{ mr: 1 }} />
                  ),
                },
              }}
            />
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              <TextField
                select
                label="Roster team"
                value={selectedTeamId}
                onChange={(event) => update('teamId', event.target.value)}
                helperText={
                  season
                    ? `Roster membership during ${season}`
                    : 'Latest team or any historical roster membership'
                }
              >
                <MenuItem value="">All teams</MenuItem>
                {teams.data?.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.abbreviation} — {team.fullName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Roster/stat season"
                value={season ?? ''}
                onChange={(event) => update('season', event.target.value)}
                helperText="Narrows team membership and player availability"
              >
                <MenuItem value="">Any imported season</MenuItem>
                {seasons.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <Stack
                component="form"
                direction="row"
                spacing={1}
                onSubmit={applyPosition}
              >
                <TextField
                  fullWidth
                  label="Raw position code"
                  value={positionDraft}
                  onChange={(event) =>
                    setPositionEdit({
                      source: urlPosition,
                      value: event.target.value,
                    })
                  }
                  slotProps={{ htmlInput: { maxLength: 16 } }}
                  helperText="Examples: QB, WR, CB. Exact backend value."
                />
                <Button type="submit" variant="outlined">
                  Apply
                </Button>
              </Stack>
            </Box>
            {favorite ? (
              <Button
                variant={teamId === favorite.id ? 'contained' : 'outlined'}
                onClick={() =>
                  update('teamId', teamId === favorite.id ? '' : favorite.id)
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                My team roster history: {favorite.abbreviation}
              </Button>
            ) : null}
          </Stack>
        </Paper>

        {query.isPending ? (
          <Typography role="status">Loading players…</Typography>
        ) : null}
        {query.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
          >
            {getPlayerErrorMessage(query.error)}
          </Alert>
        ) : null}
        {!query.isPending && !query.isError && players.length === 0 ? (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography variant="h4">No players found</Typography>
            <Typography color="text.secondary">
              Try a different name, roster team, season, or raw position code.
            </Typography>
          </Box>
        ) : null}

        {players.length ? (
          <>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ display: { xs: 'none', lg: 'block' } }}
            >
              <Table aria-label="Player directory">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Latest team</TableCell>
                    <TableCell>Jersey</TableCell>
                    <TableCell>College</TableCell>
                    <TableCell>Career range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id} hover>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={`/players/${player.id}`}
                          underline="hover"
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'center' }}
                          >
                            <PlayerAvatar
                              name={player.displayName}
                              headshotUrl={player.headshotUrl}
                              width={48}
                            />
                            <Typography sx={{ fontWeight: 900 }}>
                              {player.displayName}
                            </Typography>
                          </Stack>
                        </Link>
                      </TableCell>
                      <TableCell>{player.position ?? '—'}</TableCell>
                      <TableCell>
                        {player.latestTeam?.abbreviation ?? '—'}
                      </TableCell>
                      <TableCell>
                        {player.jerseyNumber === null
                          ? '—'
                          : `#${player.jerseyNumber}`}
                      </TableCell>
                      <TableCell>{player.college ?? '—'}</TableCell>
                      <TableCell>
                        {player.rookieSeason === null &&
                        player.lastSeason === null
                          ? '—'
                          : `${player.rookieSeason ?? '?'}–${player.lastSeason ?? '?'}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: { xs: 'grid', lg: 'none' },
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              }}
            >
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </Box>
          </>
        ) : null}

        {query.hasNextPage ? (
          <Button
            variant="outlined"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
            sx={{ alignSelf: 'center' }}
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load more players'}
          </Button>
        ) : null}
        {attribution ? <PlayerAttribution attribution={attribution} /> : null}
      </Stack>
    </Container>
  );
};
