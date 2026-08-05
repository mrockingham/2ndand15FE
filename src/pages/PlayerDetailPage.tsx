import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import CompareArrowsRounded from '@mui/icons-material/CompareArrowsRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { PlayerAttribution } from '@/features/players/components/PlayerAttribution';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { PlayerGameLog } from '@/features/players/components/PlayerGameLog';
import { SeasonStatGroups } from '@/features/players/components/SeasonStatGroups';
import { getPlayerErrorMessage } from '@/features/players/errors';
import {
  formatHeight,
  formatPlayerDate,
  isUuid,
  parsePlayerSeason,
  summaryTypeLabel,
} from '@/features/players/presentation';
import {
  usePlayerQuery,
  usePlayerSeasonsQuery,
  usePlayerStatsQuery,
} from '@/features/players/queries';
import type { PlayerSummaryType } from '@/features/players/types';
import { ApiError } from '@/services/api/apiClient';

const summaryTypes: readonly PlayerSummaryType[] = ['REG_POST', 'REG', 'POST'];

export const PlayerDetailPage = () => {
  const playerId = useParams().playerId ?? '';
  const validId = isUuid(playerId);
  const [parameters, setParameters] = useSearchParams();
  const playerQuery = usePlayerQuery(validId ? playerId : '');
  const seasonsQuery = usePlayerSeasonsQuery(validId ? playerId : '');
  const availableSeasons = [
    ...new Set(seasonsQuery.data?.seasons.map((row) => row.season) ?? []),
  ].sort((a, b) => b - a);
  const requestedSeason = parsePlayerSeason(parameters.get('season'));
  const season =
    requestedSeason && availableSeasons.includes(requestedSeason)
      ? requestedSeason
      : availableSeasons[0];
  const requestedType = parameters.get('type') as PlayerSummaryType | null;
  const availableTypes =
    seasonsQuery.data?.seasons
      .filter((row) => row.season === season)
      .map((row) => row.summaryType) ?? [];
  const summaryType =
    requestedType &&
    summaryTypes.includes(requestedType) &&
    availableTypes.includes(requestedType)
      ? requestedType
      : summaryTypes.find((type) => availableTypes.includes(type));
  const summary = seasonsQuery.data?.seasons.find(
    (row) => row.season === season && row.summaryType === summaryType,
  );
  const statsQuery = usePlayerStatsQuery(
    validId ? playerId : '',
    {
      season,
      ...(summaryType === 'REG' || summaryType === 'POST'
        ? { seasonType: summaryType }
        : {}),
      limit: 100,
    },
    season !== undefined,
  );
  const allStats = statsQuery.data?.pages.flatMap((page) => page.stats) ?? [];
  const stats =
    summaryType === 'REG_POST'
      ? allStats.filter((row) => row.seasonType !== 'PRE')
      : allStats;

  useEffect(() => {
    if (
      season === undefined ||
      (requestedSeason === season && requestedType === summaryType)
    )
      return;
    const next = new URLSearchParams(parameters);
    next.set('season', String(season));
    if (summaryType) next.set('type', summaryType);
    else next.delete('type');
    setParameters(next, { replace: true });
  }, [
    parameters,
    requestedSeason,
    requestedType,
    season,
    setParameters,
    summaryType,
  ]);

  if (!validId) return <NotFound message="The player link is invalid." />;
  if (playerQuery.isPending || seasonsQuery.isPending)
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography role="status">Loading player profile…</Typography>
      </Container>
    );
  if (playerQuery.error instanceof ApiError && playerQuery.error.status === 404)
    return <NotFound message="The requested player was not found." />;
  if (playerQuery.isError)
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void playerQuery.refetch()}>
              Retry
            </Button>
          }
        >
          {getPlayerErrorMessage(playerQuery.error)}
        </Alert>
      </Container>
    );
  if (!playerQuery.data)
    return <NotFound message="The requested player was not found." />;
  const player = playerQuery.data.player;
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    next.set(key, value);
    setParameters(next);
  };
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between' }}
        >
          <Button
            component={RouterLink}
            to="/players"
            startIcon={<ArrowBackRounded />}
          >
            Players
          </Button>
          <Button
            component={RouterLink}
            to={`/players/compare?left=${player.id}`}
            startIcon={<CompareArrowsRounded />}
          >
            Compare
          </Button>
        </Stack>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <PlayerAvatar
              name={player.displayName}
              headshotUrl={player.headshotUrl}
              width={150}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="overline" color="primary.light">
                PLAYER PROFILE
              </Typography>
              <Typography component="h1" variant="h2">
                {player.displayName}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}
              >
                {player.position ? (
                  <Chip color="primary" label={player.position} />
                ) : null}
                {player.positionGroup ? (
                  <Chip label={player.positionGroup} variant="outlined" />
                ) : null}
                {player.latestTeam ? (
                  <Chip
                    label={`Latest team: ${player.latestTeam.abbreviation}`}
                    variant="outlined"
                  />
                ) : null}
                {player.jerseyNumber === null ? null : (
                  <Chip label={`#${player.jerseyNumber}`} variant="outlined" />
                )}
                {player.status ? (
                  <Chip label={player.status} variant="outlined" />
                ) : null}
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  mt: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                }}
              >
                <Info label="Born" value={formatPlayerDate(player.birthDate)} />
                <Info
                  label="Height"
                  value={formatHeight(player.heightInches)}
                />
                <Info
                  label="Weight"
                  value={
                    player.weightPounds === null
                      ? 'Not available'
                      : `${player.weightPounds} lb`
                  }
                />
                <Info
                  label="College"
                  value={player.college ?? 'Not available'}
                />
                <Info
                  label="Rookie season"
                  value={player.rookieSeason?.toString() ?? 'Not available'}
                />
                <Info
                  label="Last recorded season"
                  value={player.lastSeason?.toString() ?? 'Not available'}
                />
                <Info
                  label="Draft"
                  value={
                    player.draft
                      ? `${player.draft.year}${player.draft.round === null ? '' : ` · Round ${player.draft.round}`}${player.draft.pick === null ? '' : ` · Pick ${player.draft.pick}`}`
                      : 'Not available'
                  }
                />
              </Box>
            </Box>
          </Stack>
        </Paper>

        {seasonsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => void seasonsQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            {getPlayerErrorMessage(seasonsQuery.error)}
          </Alert>
        ) : null}
        {!seasonsQuery.isError && availableSeasons.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4">No season statistics available</Typography>
            <Typography color="text.secondary">
              This player has a profile but no imported season appearances.
            </Typography>
          </Paper>
        ) : null}
        {season && summaryType && summary ? (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Season"
                value={season}
                onChange={(event) => update('season', event.target.value)}
                sx={{ minWidth: 180 }}
              >
                {availableSeasons.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Season summary"
                value={summaryType}
                onChange={(event) => update('type', event.target.value)}
                sx={{ minWidth: 260 }}
              >
                {summaryTypes
                  .filter((type) => availableTypes.includes(type))
                  .map((type) => (
                    <MenuItem key={type} value={type}>
                      {summaryTypeLabel[type]}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
            <Box component="section" aria-labelledby="season-summary">
              <Typography
                id="season-summary"
                component="h2"
                variant="h3"
                sx={{ mb: 2 }}
              >
                {season} {summaryTypeLabel[summaryType]} summary
              </Typography>
              <SeasonStatGroups stat={summary} />
            </Box>
            <Box component="section" aria-labelledby="game-log">
              <Typography
                id="game-log"
                component="h2"
                variant="h3"
                sx={{ mb: 0.5 }}
              >
                Recorded appearances
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Only stored game-stat records are shown. Missing weeks, byes,
                and non-appearances are not converted into zero-stat rows.
              </Typography>
              {statsQuery.isPending ? (
                <Typography role="status">Loading game log…</Typography>
              ) : null}
              {statsQuery.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      onClick={() => void statsQuery.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  {getPlayerErrorMessage(statsQuery.error)}
                </Alert>
              ) : (
                <PlayerGameLog stats={stats} />
              )}
              {statsQuery.hasNextPage ? (
                <Button
                  sx={{ mt: 2 }}
                  onClick={() => void statsQuery.fetchNextPage()}
                  disabled={statsQuery.isFetchingNextPage}
                >
                  Load more appearances
                </Button>
              ) : null}
            </Box>
          </>
        ) : null}
        <PlayerAttribution attribution={playerQuery.data.attribution} />
      </Stack>
    </Container>
  );
};

const Info = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <div>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
  </div>
);
const NotFound = ({ message }: { readonly message: string }) => (
  <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
    <Typography component="h1" variant="h3">
      Player not found
    </Typography>
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      {message}
    </Typography>
    <Button component={RouterLink} to="/players" sx={{ mt: 2 }}>
      Browse players
    </Button>
  </Container>
);
