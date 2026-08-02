import AddRounded from '@mui/icons-material/AddRounded';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { StatusChips } from '@/features/admin/components/StatusChips';
import { formatAdminDateTime, seasonTypeLabel } from '@/features/admin/format';
import { useAdminGamesQuery } from '@/features/admin/queries';

const currentSeason = new Date().getUTCFullYear();
const seasons = Array.from(
  { length: 8 },
  (_, index) => currentSeason + 1 - index,
);

export const AdminGamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonValue = searchParams.get('season');
  const cursor = searchParams.get('cursor') ?? undefined;
  const season =
    seasonValue && /^\d{4}$/.test(seasonValue)
      ? Number(seasonValue)
      : undefined;
  const filters = { season, limit: 50, cursor };
  const query = useAdminGamesQuery(filters);

  const setSeason = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === '') next.delete('season');
    else next.set('season', value);
    next.delete('cursor');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <AdminPageHeader
        title="Schedule games"
        description="Review normalized schedule records, provenance, verification, and editorial overrides."
        action={
          <Button
            component={RouterLink}
            to="/admin/games/new"
            variant="contained"
            startIcon={<AddRounded />}
          >
            Create game
          </Button>
        }
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="season-filter-label">Season</InputLabel>
          <Select
            labelId="season-filter-label"
            label="Season"
            value={seasonValue ?? ''}
            onChange={(event) => setSeason(event.target.value)}
          >
            <MenuItem value="">All available seasons</MenuItem>
            {seasons.map((value) => (
              <MenuItem key={value} value={String(value)}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      {query.isPending ? <AdminLoading /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data?.games.length === 0 ? (
        <AdminEmpty
          title="No games found"
          description="No schedule records match the selected season."
        />
      ) : null}
      {query.data && query.data.games.length > 0 ? (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <Table aria-label="Administrative schedule games">
              <TableHead>
                <TableRow>
                  <TableCell>Kickoff</TableCell>
                  <TableCell>Matchup</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>State</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.games.map((game) => (
                  <TableRow
                    key={game.id}
                    hover
                    component={RouterLink}
                    to={`/admin/games/${game.id}`}
                    sx={{
                      textDecoration: 'none',
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      {formatAdminDateTime(game.resolved.startTime)}
                    </TableCell>
                    <TableCell>
                      <strong>{game.resolved.awayTeam.abbreviation}</strong> at{' '}
                      <strong>{game.resolved.homeTeam.abbreviation}</strong>
                    </TableCell>
                    <TableCell>
                      {seasonTypeLabel[game.resolved.seasonType]} · Week{' '}
                      {game.resolved.week ?? '—'}
                    </TableCell>
                    <TableCell>
                      {game.resolved.venue.name ?? 'TBD'}
                      {game.resolved.venue.city
                        ? `, ${game.resolved.venue.city}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      {game.resolved.broadcastNetwork ?? 'TBD'}
                    </TableCell>
                    <TableCell>
                      <StatusChips game={game} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { lg: 'none' } }}>
            {query.data.games.map((game) => (
              <Card
                key={game.id}
                variant="outlined"
                sx={{
                  borderLeft: game.override ? 4 : undefined,
                  borderLeftColor: game.override ? 'warning.main' : undefined,
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={`/admin/games/${game.id}`}
                >
                  <CardContent>
                    <Typography variant="overline">
                      {formatAdminDateTime(game.resolved.startTime)}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 0.5 }}>
                      {game.resolved.awayTeam.fullName} at{' '}
                      {game.resolved.homeTeam.fullName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                      {seasonTypeLabel[game.resolved.seasonType]} · Week{' '}
                      {game.resolved.week ?? '—'} ·{' '}
                      {game.resolved.venue.name ?? 'Venue TBD'}
                    </Typography>
                    <StatusChips game={game} />
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              disabled={!query.data.nextCursor}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (query.data.nextCursor)
                  next.set('cursor', query.data.nextCursor);
                setSearchParams(next);
              }}
            >
              Next page
            </Button>
          </Box>
        </>
      ) : null}
    </>
  );
};
