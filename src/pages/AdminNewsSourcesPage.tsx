import AddRounded from '@mui/icons-material/AddRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SourceStatusChip } from '@/features/newsInbox/components/NewsStatusChip';
import {
  formatInboxDate,
  safeHostname,
  sourceKindLabel,
} from '@/features/newsInbox/presentation';
import { useNewsSourcesQuery } from '@/features/newsInbox/queries';
import type {
  NewsSourceKind,
  NewsSourceStatus,
} from '@/features/newsInbox/types';
import { useCurrentUserQuery } from '@/features/users/queries';

const statuses: readonly NewsSourceStatus[] = [
  'ACTIVE',
  'PAUSED',
  'DISABLED',
  'ERROR',
];
const kinds: readonly NewsSourceKind[] = ['RSS', 'ATOM', 'MANUAL_ONLY'];

export const AdminNewsSourcesPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const statusValue = parameters.get('status') ?? '';
  const kindValue = parameters.get('kind') ?? '';
  const filters = {
    limit: 25,
    status: statuses.includes(statusValue as NewsSourceStatus)
      ? (statusValue as NewsSourceStatus)
      : undefined,
    kind: kinds.includes(kindValue as NewsSourceKind)
      ? (kindValue as NewsSourceKind)
      : undefined,
  };
  const query = useNewsSourcesQuery(filters);
  const isAdmin = useCurrentUserQuery().data?.role === 'ADMIN';
  const sources = query.data?.pages.flatMap((page) => page.sources) ?? [];
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    setParameters(next);
  };
  return (
    <>
      <AdminPageHeader
        title="News sources"
        description="Monitor registered publishers and run explicit feed tests or ingestion."
        action={
          isAdmin ? (
            <Button
              component={RouterLink}
              to="/admin/news-sources/new"
              variant="contained"
              startIcon={<AddRounded />}
            >
              New source
            </Button>
          ) : undefined
        }
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
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
            fullWidth
            select
            label="Kind"
            value={kindValue}
            onChange={(event) => update('kind', event.target.value)}
          >
            <MenuItem value="">All kinds</MenuItem>
            {kinds.map((kind) => (
              <MenuItem key={kind} value={kind}>
                {sourceKindLabel[kind]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {query.isPending ? <AdminLoading label="Loading news sources" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {!query.isPending && !query.isError && sources.length === 0 ? (
        <AdminEmpty
          title="No news feeds are configured"
          description={
            isAdmin
              ? 'Register a source to begin testing feeds and collecting candidates.'
              : 'An administrator must register the first source.'
          }
        />
      ) : null}
      {sources.length ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {sources.map((source) => {
            const hostname = safeHostname(source.feedUrl);
            return (
              <Card key={source.id} variant="outlined">
                <CardActionArea
                  component={RouterLink}
                  to={`/admin/news-sources/${source.id}`}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <Typography component="h2" variant="h5">
                          {source.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {source.publisherName}
                        </Typography>
                      </div>
                      <SourceStatusChip status={source.status} />
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ my: 2, flexWrap: 'wrap', gap: 0.75 }}
                    >
                      <Chip size="small" label={sourceKindLabel[source.kind]} />
                      {source.defaultTeam ? (
                        <Chip
                          size="small"
                          label={source.defaultTeam.abbreviation}
                        />
                      ) : null}
                      {source.isOfficialLeague ? (
                        <Chip
                          size="small"
                          label="Official league"
                          variant="outlined"
                        />
                      ) : null}
                      {source.isOfficialTeam ? (
                        <Chip
                          size="small"
                          label="Official team"
                          variant="outlined"
                        />
                      ) : null}
                    </Stack>
                    <Typography variant="body2">
                      Last checked:{' '}
                      {formatInboxDate(source.health.lastCheckedAt)}
                    </Typography>
                    <Typography variant="body2">
                      Last success:{' '}
                      {formatInboxDate(source.health.lastSuccessfulAt)}
                    </Typography>
                    <Typography variant="body2">
                      Last item count: {source.health.lastItemCount} ·
                      Consecutive failures:{' '}
                      {source.health.consecutiveFailureCount}
                    </Typography>
                    {source.health.lastErrorSummary ? (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {source.health.lastErrorSummary}
                      </Typography>
                    ) : null}
                    {hostname ? (
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 2,
                        }}
                      >
                        {hostname}
                        <OpenInNewRounded fontSize="inherit" />
                      </Typography>
                    ) : null}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      ) : null}
      {query.hasNextPage ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load more sources'}
          </Button>
        </Box>
      ) : null}
    </>
  );
};
