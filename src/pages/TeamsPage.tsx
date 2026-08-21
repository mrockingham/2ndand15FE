import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { TeamDirectoryCard } from '@/features/teamHub/components/TeamDirectoryCard';
import { groupTeams } from '@/features/teamHub/presentation';
import {
  normalizeTeamDirectoryUrl,
  type TeamDirectoryConference,
  type TeamDirectoryDivision,
} from '@/features/teamHub/urlState';
import { useTeamsQuery } from '@/features/teams/queries';

const divisions: readonly TeamDirectoryDivision[] = [
  'ALL',
  'East',
  'North',
  'South',
  'West',
];

export const TeamsPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const filters = normalizeTeamDirectoryUrl(parameters);
  const teamsQuery = useTeamsQuery();

  useEffect(() => {
    const normalized = new URLSearchParams();
    if (filters.search) normalized.set('search', filters.search);
    if (filters.conference !== 'ALL')
      normalized.set('conference', filters.conference);
    if (filters.division !== 'ALL')
      normalized.set('division', filters.division);
    if (normalized.toString() !== parameters.toString())
      setParameters(normalized, { replace: true });
  }, [filters, parameters, setParameters]);

  const visibleTeams = useMemo(() => {
    const search = filters.search.toLocaleLowerCase();
    return (teamsQuery.data ?? []).filter(
      (team) =>
        (filters.conference === 'ALL' ||
          team.conference === filters.conference) &&
        (filters.division === 'ALL' || team.division === filters.division) &&
        (search === '' ||
          [team.fullName, team.city, team.name, team.abbreviation].some(
            (value) => value.toLocaleLowerCase().includes(search),
          )),
    );
  }, [filters, teamsQuery.data]);
  const groups = groupTeams(visibleTeams);

  const update = (key: 'search' | 'conference' | 'division', value: string) => {
    const next = new URLSearchParams(parameters);
    if (value && value !== 'ALL') next.set(key, value);
    else next.delete(key);
    setParameters(next);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" color="primary.light">
            NFL TEAM DIRECTORY
          </Typography>
          <Typography component="h1" variant="h2">
            Teams
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            Browse active NFL teams by conference and division, then open a team
            hub for schedule, published news, historical rosters, and
            team-scoped statistical leaders.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
          }}
        >
          <TextField
            label="Search teams"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="City, nickname, full name, or abbreviation"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded aria-hidden="true" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="Conference"
            value={filters.conference}
            onChange={(event) =>
              update(
                'conference',
                event.target.value as TeamDirectoryConference,
              )
            }
          >
            <MenuItem value="ALL">All Conferences</MenuItem>
            <MenuItem value="AFC">AFC</MenuItem>
            <MenuItem value="NFC">NFC</MenuItem>
          </TextField>
          <TextField
            select
            label="Division"
            value={filters.division}
            onChange={(event) =>
              update('division', event.target.value as TeamDirectoryDivision)
            }
          >
            {divisions.map((division) => (
              <MenuItem key={division} value={division}>
                {division === 'ALL' ? 'All Divisions' : division}
              </MenuItem>
            ))}
          </TextField>
          <Button
            startIcon={<RestartAltRounded />}
            onClick={() => setParameters(new URLSearchParams())}
          >
            Reset
          </Button>
        </Box>

        {teamsQuery.isPending ? (
          <Box
            aria-label="Loading teams"
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
            }}
          >
            {Array.from({ length: 8 }, (_value, index) => (
              <Skeleton key={index} variant="rounded" height={150} />
            ))}
          </Box>
        ) : null}
        {teamsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void teamsQuery.refetch()}>
                Retry
              </Button>
            }
          >
            The NFL team directory could not be loaded.
          </Alert>
        ) : null}
        {teamsQuery.isSuccess && visibleTeams.length === 0 ? (
          <Alert severity="info">
            No active teams match the selected search and filters.
          </Alert>
        ) : null}

        {groups.map((conference) => {
          const count = conference.divisions.reduce(
            (total, division) => total + division.teams.length,
            0,
          );
          if (count === 0) return null;
          return (
            <Box
              key={conference.conference}
              component="section"
              aria-labelledby={`${conference.conference}-title`}
            >
              <Typography
                id={`${conference.conference}-title`}
                component="h2"
                variant="h3"
                sx={{ mb: 2 }}
              >
                {conference.conference}
              </Typography>
              <Stack spacing={3}>
                {conference.divisions.map((division) =>
                  division.teams.length ? (
                    <Box key={division.division}>
                      <Typography component="h3" variant="h5" sx={{ mb: 1.25 }}>
                        {division.division}
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.5,
                          gridTemplateColumns: {
                            sm: 'repeat(2, 1fr)',
                            lg: 'repeat(4, 1fr)',
                          },
                        }}
                      >
                        {division.teams.map((team) => (
                          <TeamDirectoryCard key={team.id} team={team} />
                        ))}
                      </Box>
                    </Box>
                  ) : null,
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Container>
  );
};
