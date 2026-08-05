import AddRounded from '@mui/icons-material/AddRounded';
import {
  Box,
  Button,
  Chip,
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
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { CandidateCard } from '@/features/newsInbox/components/CandidateCard';
import { CandidateStatusChip } from '@/features/newsInbox/components/NewsStatusChip';
import { formatInboxDate } from '@/features/newsInbox/presentation';
import {
  useNewsCandidatesQuery,
  useNewsSourcesQuery,
} from '@/features/newsInbox/queries';
import type { NewsCandidateStatus } from '@/features/newsInbox/types';
import { useTeamsQuery } from '@/features/teams/queries';

const statuses: readonly NewsCandidateStatus[] = [
  'NEW',
  'REVIEWING',
  'SAVED',
  'CONVERTED',
  'DISMISSED',
];

const dateFilter = (value: string, endOfDay = false) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const AdminNewsCandidatesPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const [search, setSearch] = useState(parameters.get('search') ?? '');
  const statusValue = parameters.get('status') ?? '';
  const publishedFrom = parameters.get('publishedFrom') ?? '';
  const publishedTo = parameters.get('publishedTo') ?? '';
  const filters = {
    limit: 25,
    status: statuses.includes(statusValue as NewsCandidateStatus)
      ? (statusValue as NewsCandidateStatus)
      : undefined,
    sourceId: parameters.get('sourceId') || undefined,
    teamId: parameters.get('teamId') || undefined,
    publishedFrom: dateFilter(publishedFrom),
    publishedTo: dateFilter(publishedTo, true),
    search:
      (parameters.get('search') ?? '').trim().length >= 2
        ? (parameters.get('search') ?? '').trim()
        : undefined,
  };
  const query = useNewsCandidatesQuery(filters);
  const sourcesQuery = useNewsSourcesQuery({ limit: 100 });
  const sources =
    sourcesQuery.data?.pages.flatMap((page) => page.sources) ?? [];
  const teams = useTeamsQuery();
  const candidates = query.data?.pages.flatMap((page) => page.candidates) ?? [];
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    setParameters(next);
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    update('search', search.trim().length >= 2 ? search.trim() : '');
  };
  return (
    <>
      <AdminPageHeader
        title="Candidate inbox"
        description="Review private story metadata, record editorial decisions, and convert selected candidates into curated drafts."
        action={
          <Button
            component={RouterLink}
            to="/admin/news-candidates/manual"
            variant="contained"
            startIcon={<AddRounded />}
          >
            Add manual candidate
          </Button>
        }
      />
      <Paper
        component="form"
        variant="outlined"
        sx={{ p: 2, mb: 3 }}
        onSubmit={submitSearch}
      >
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Search headlines"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              helperText="Enter at least 2 characters"
            />
            <Button type="submit" variant="outlined">
              Search
            </Button>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
            }}
          >
            <TextField
              select
              label="Status"
              value={statusValue}
              onChange={(event) => update('status', event.target.value)}
            >
              <MenuItem value="">All statuses</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Source"
              value={parameters.get('sourceId') ?? ''}
              onChange={(event) => update('sourceId', event.target.value)}
            >
              <MenuItem value="">All sources</MenuItem>
              {sources.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Team"
              value={parameters.get('teamId') ?? ''}
              onChange={(event) => update('teamId', event.target.value)}
            >
              <MenuItem value="">All teams</MenuItem>
              {teams.data?.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.abbreviation}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Published from"
              type="date"
              value={publishedFrom}
              onChange={(event) => update('publishedFrom', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Published to"
              type="date"
              value={publishedTo}
              onChange={(event) => update('publishedTo', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Stack>
      </Paper>
      {query.isPending ? <AdminLoading label="Loading candidates" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {!query.isPending && !query.isError && candidates.length === 0 ? (
        <AdminEmpty
          title="No candidates found"
          description="No editorial candidates match these filters."
        />
      ) : null}
      {candidates.length ? (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <Table aria-label="Editorial news candidates">
              <TableHead>
                <TableRow>
                  <TableCell>Headline</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Discovered</TableCell>
                  <TableCell>Suggested teams</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    component={RouterLink}
                    to={`/admin/news-candidates/${candidate.id}`}
                    hover
                    sx={{ textDecoration: 'none' }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }}>
                        {candidate.headline}
                      </Typography>
                      {candidate.convertedArticleId ? (
                        <Typography variant="caption" color="text.secondary">
                          Curated draft created
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{candidate.sourceName}</TableCell>
                    <TableCell>
                      <CandidateStatusChip status={candidate.status} />
                    </TableCell>
                    <TableCell>
                      {formatInboxDate(candidate.sourcePublishedAt)}
                    </TableCell>
                    <TableCell>
                      {formatInboxDate(candidate.discoveredAt)}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {candidate.suggestedTeams.map((team) => (
                          <Chip
                            key={team.id}
                            size="small"
                            label={team.abbreviation}
                          />
                        ))}
                        {candidate.suggestedTeams.length === 0
                          ? 'League-wide'
                          : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: { xs: 'grid', lg: 'none' }, gap: 2 }}>
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </Box>
        </>
      ) : null}
      {query.hasNextPage ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load more candidates'}
          </Button>
        </Box>
      ) : null}
    </>
  );
};
