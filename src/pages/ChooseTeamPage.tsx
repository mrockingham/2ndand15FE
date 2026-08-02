import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TeamOptionCard } from '@/features/teams/components/TeamOptionCard';
import { getFavoriteTeamErrorMessage } from '@/features/teams/favoriteTeamErrors';
import {
  useFavoriteTeamMutation,
  useTeamsQuery,
} from '@/features/teams/queries';
import { filterTeams } from '@/features/teams/teamPresentation';
import type { ConferenceFilter } from '@/features/teams/types';
import { sanitizeInternalDestination } from '@/features/auth/safeRedirect';
import { useCurrentUserQuery } from '@/features/users/queries';

const readDestination = (state: unknown) => {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '/';
  }
  return sanitizeInternalDestination(state.from, '/');
};

const TeamGridSkeleton = () => (
  <Box
    aria-label="Loading teams"
    aria-busy="true"
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(3, minmax(0, 1fr))',
      },
    }}
  >
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} variant="rounded" height={150} />
    ))}
  </Box>
);

export const ChooseTeamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const teamsQuery = useTeamsQuery();
  const favoriteMutation = useFavoriteTeamMutation();
  const [search, setSearch] = useState('');
  const [conference, setConference] = useState<ConferenceFilter>('ALL');
  const [chosenTeamId, setChosenTeamId] = useState<string | null | undefined>(
    undefined,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const destination = readDestination(location.state);

  const selectedTeamId =
    chosenTeamId === undefined
      ? (currentUserQuery.data?.favoriteTeam?.id ?? null)
      : chosenTeamId;

  const visibleTeams = useMemo(
    () => filterTeams(teamsQuery.data ?? [], search, conference),
    [conference, search, teamsQuery.data],
  );

  const saveFavorite = async () => {
    if (selectedTeamId === null || favoriteMutation.isPending) {
      return;
    }
    setSubmissionError(null);
    try {
      await favoriteMutation.mutateAsync(selectedTeamId);
      await navigate(destination, { replace: true });
    } catch (error: unknown) {
      setSubmissionError(getFavoriteTeamErrorMessage(error));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Box sx={{ maxWidth: 760 }}>
          <Typography variant="overline" color="primary.light">
            MAKE IT YOURS
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 1.5 }}>
            Choose your favorite team
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
            Personalize your home around one NFL team. You can change or clear
            this choice later from your account.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' } }}
        >
          <TextField
            label="Search teams"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="City, team name, or abbreviation"
            sx={{ width: { xs: '100%', md: 420 } }}
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
          <ToggleButtonGroup
            exclusive
            value={conference}
            onChange={(_, value: ConferenceFilter | null) => {
              if (value !== null) setConference(value);
            }}
            aria-label="Filter by conference"
            size="small"
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="AFC">AFC</ToggleButton>
            <ToggleButton value="NFC">NFC</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {submissionError === null ? null : (
          <Alert severity="error" aria-live="polite">
            {submissionError}
          </Alert>
        )}

        {teamsQuery.isPending ? <TeamGridSkeleton /> : null}

        {teamsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button onClick={() => void teamsQuery.refetch()}>Retry</Button>
            }
          >
            We couldnâ€™t load the NFL team catalog. Check your connection and
            try again.
          </Alert>
        ) : null}

        {teamsQuery.isSuccess && teamsQuery.data.length === 0 ? (
          <Alert severity="info">
            No active NFL teams are available right now.
          </Alert>
        ) : null}

        {teamsQuery.isSuccess &&
        teamsQuery.data.length > 0 &&
        visibleTeams.length === 0 ? (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography variant="h3" component="h2">
              No teams match your search
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Try another city, team name, abbreviation, or conference.
            </Typography>
          </Box>
        ) : null}

        {visibleTeams.length > 0 ? (
          <Box
            role="radiogroup"
            aria-label="NFL teams"
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {visibleTeams.map((team) => (
              <TeamOptionCard
                key={team.id}
                team={team}
                selected={selectedTeamId === team.id}
                disabled={favoriteMutation.isPending}
                onSelect={setChosenTeamId}
              />
            ))}
          </Box>
        ) : null}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            position: 'sticky',
            bottom: { xs: 78, md: 16 },
            zIndex: 2,
            alignItems: { sm: 'center' },
            p: 2,
            border: '1px solid',
            borderColor: 'appSurfaces.borderStrong',
            borderRadius: 2,
            bgcolor: 'appSurfaces.header',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Button
            variant="contained"
            disabled={selectedTeamId === null || favoriteMutation.isPending}
            onClick={() => void saveFavorite()}
          >
            {favoriteMutation.isPending ? 'Savingâ€¦' : 'Save and continue'}
          </Button>
          <Button
            variant="text"
            disabled={favoriteMutation.isPending}
            onClick={() => void navigate(destination, { replace: true })}
          >
            Skip for now
          </Button>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {selectedTeamId === null
              ? 'No team selected'
              : `${teamsQuery.data?.find((team) => team.id === selectedTeamId)?.fullName ?? 'Team'} selected`}
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
};
