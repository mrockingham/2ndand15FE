import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { StandingsGroups } from '@/features/standings/components/StandingsGroups';
import { StandingsSkeleton } from '@/features/standings/components/StandingsSkeleton';
import {
  getStandingsErrorMessage,
  isStandingsNotFound,
} from '@/features/standings/errors';
import {
  formatStandingsUpdatedAt,
  standingsPageTitle,
  standingsSeasonLabel,
} from '@/features/standings/presentation';
import { useStandingsQuery } from '@/features/standings/queries';
import type {
  StandingsFilters,
  StandingsView,
} from '@/features/standings/types';
import {
  normalizeStandingsUrlState,
  serializeStandingsUrlState,
  STANDINGS_SEASONS,
  standingsSeasonTypes,
  updateStandingsUrlState,
} from '@/features/standings/urlState';

export const StandingsPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const state = useMemo(
    () => normalizeStandingsUrlState(parameters),
    [parameters],
  );
  const query = useStandingsQuery(state);
  const response = query.data;

  useEffect(() => {
    const normalized = serializeStandingsUrlState(state);
    if (normalized.toString() !== parameters.toString())
      setParameters(normalized, { replace: true });
  }, [parameters, setParameters, state]);

  const change = (changes: Partial<StandingsFilters>) =>
    setParameters(
      serializeStandingsUrlState(updateStandingsUrlState(state, changes)),
    );
  const updatedAt = response
    ? formatStandingsUpdatedAt(response.meta.updatedAt)
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'end' } }}
        >
          <Box>
            <Typography variant="overline" color="primary.light">
              NFL STANDINGS
            </Typography>
            <Typography component="h1" variant="h2">
              {standingsPageTitle(state.season, state.seasonType)}
            </Typography>
            <Typography color="text.secondary">
              Backend-authoritative records and scoring through the latest
              stored snapshot.
            </Typography>
          </Box>
          {updatedAt ? (
            <Typography variant="caption" color="text.secondary">
              Updated {updatedAt}
            </Typography>
          ) : null}
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 220px)' },
              }}
            >
              <TextField
                select
                label="Year"
                value={state.season}
                onChange={(event) =>
                  change({ season: Number(event.target.value) })
                }
              >
                {STANDINGS_SEASONS.map((season) => (
                  <MenuItem key={season} value={season}>
                    {season}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Season"
                value={state.seasonType}
                onChange={(event) =>
                  change({
                    seasonType: event.target.value as 'PRE' | 'REG',
                  })
                }
              >
                {standingsSeasonTypes(state.season).map((type) => (
                  <MenuItem key={type} value={type}>
                    {standingsSeasonLabel(type)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <Typography component="h2" variant="subtitle2" sx={{ mb: 0.5 }}>
                View
              </Typography>
              <Tabs
                value={state.view}
                onChange={(_event, view: StandingsView) => change({ view })}
                aria-label="Standings view"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab value="division" label="Division" />
                <Tab value="conference" label="Conference" />
                <Tab value="league" label="League" />
              </Tabs>
            </Box>
          </Stack>
        </Paper>

        {state.seasonType === 'PRE' ? (
          <Alert severity="info" icon={<EmojiEventsRounded />}>
            Preseason standings do not indicate playoff qualification or
            elimination.
          </Alert>
        ) : null}

        {query.isPending ? <StandingsSkeleton /> : null}
        {query.isError && isStandingsNotFound(query.error) ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography component="h2" variant="h4">
              Standings aren&apos;t available for this season yet.
            </Typography>
            <Typography color="text.secondary">
              Try another available year or season type.
            </Typography>
          </Paper>
        ) : null}
        {query.isError && !isStandingsNotFound(query.error) ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
          >
            {getStandingsErrorMessage(query.error)}
          </Alert>
        ) : null}
        {response ? <StandingsGroups data={response.data} /> : null}
      </Stack>
    </Container>
  );
};
