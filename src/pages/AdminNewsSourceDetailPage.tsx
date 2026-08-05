import EditRounded from '@mui/icons-material/EditRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { IngestionResultPanel } from '@/features/newsInbox/components/IngestionResultPanel';
import {
  RunStatusChip,
  SourceStatusChip,
} from '@/features/newsInbox/components/NewsStatusChip';
import { SourceForm } from '@/features/newsInbox/components/SourceForm';
import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';
import {
  formatInboxDate,
  sourceKindLabel,
} from '@/features/newsInbox/presentation';
import {
  useNewsIngestionMutation,
  useNewsSourceQuery,
  useNewsSourceStatusMutation,
  useUpdateNewsSourceMutation,
} from '@/features/newsInbox/queries';
import type { IngestionResult } from '@/features/newsInbox/types';
import { useCurrentUserQuery } from '@/features/users/queries';

export const AdminNewsSourceDetailPage = () => {
  const sourceId = useParams().sourceId ?? '';
  const query = useNewsSourceQuery(sourceId);
  const role = useCurrentUserQuery().data?.role;
  const isAdmin = role === 'ADMIN';
  const [editing, setEditing] = useState(false);
  const [confirmIngest, setConfirmIngest] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const update = useUpdateNewsSourceMutation(sourceId);
  const pause = useNewsSourceStatusMutation(sourceId, 'pause');
  const resume = useNewsSourceStatusMutation(sourceId, 'resume');
  const test = useNewsIngestionMutation(sourceId, 'test');
  const ingest = useNewsIngestionMutation(sourceId, 'ingest');
  if (query.isPending) return <AdminLoading label="Loading source" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );
  const { source, recentRuns } = query.data;
  const requestError =
    pause.error ?? resume.error ?? test.error ?? ingest.error;
  const fetchable =
    source.kind !== 'MANUAL_ONLY' && source.status !== 'DISABLED';
  const ingestible =
    source.kind !== 'MANUAL_ONLY' &&
    ['ACTIVE', 'ERROR'].includes(source.status) &&
    !source.health.runActive;
  return (
    <>
      <AdminPageHeader
        title={source.name}
        description={`${source.publisherName} · ${sourceKindLabel[source.kind]}`}
        action={
          <Button component={RouterLink} to="/admin/news-sources">
            All sources
          </Button>
        }
      />
      {requestError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getNewsInboxErrorMessage(requestError)}
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <SourceStatusChip status={source.status} />
              <Typography variant="body2">
                Updated {formatInboxDate(source.updatedAt)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              <Button
                variant="outlined"
                disabled={
                  !fetchable || test.isPending || source.health.runActive
                }
                onClick={() => test.mutate(undefined, { onSuccess: setResult })}
              >
                {test.isPending ? 'Testing…' : 'Test source'}
              </Button>
              <Button
                variant="contained"
                disabled={!ingestible || ingest.isPending}
                onClick={() => setConfirmIngest(true)}
              >
                {ingest.isPending ? 'Ingesting…' : 'Run ingestion'}
              </Button>
              {isAdmin && source.status === 'ACTIVE' ? (
                <Button
                  color="warning"
                  onClick={() => pause.mutate()}
                  disabled={pause.isPending}
                >
                  Pause
                </Button>
              ) : null}
              {isAdmin && ['PAUSED', 'ERROR'].includes(source.status) ? (
                <Button
                  onClick={() => resume.mutate()}
                  disabled={resume.isPending}
                >
                  Resume
                </Button>
              ) : null}
              {isAdmin ? (
                <Button
                  startIcon={<EditRounded />}
                  onClick={() => setEditing((value) => !value)}
                >
                  {editing ? 'Close editor' : 'Edit source'}
                </Button>
              ) : null}
            </Stack>
          </Stack>
          <Alert severity="info">
            <strong>Test source</strong> fetches and parses without creating
            candidates. <strong>Run ingestion</strong> may create or update
            private candidate records.
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            }}
          >
            <Info label="Feed URL" value={source.feedUrl} link />
            <Info label="Website" value={source.siteUrl} link />
            <Info
              label="Default team"
              value={
                source.defaultTeam
                  ? `${source.defaultTeam.abbreviation} — ${source.defaultTeam.fullName}`
                  : 'None'
              }
            />
            <Info
              label="Description use"
              value={
                source.allowsDescriptionUse
                  ? 'Publisher permits use'
                  : 'Not permitted'
              }
            />
            <Info
              label="Last checked"
              value={formatInboxDate(source.health.lastCheckedAt)}
            />
            <Info
              label="Last successful"
              value={formatInboxDate(source.health.lastSuccessfulAt)}
            />
            <Info
              label="Conditional validators"
              value={
                source.health.hasEtag || source.health.hasModifiedValidator
                  ? 'Present (values hidden)'
                  : 'None recorded'
              }
            />
            <Info
              label="Consecutive failures"
              value={String(source.health.consecutiveFailureCount)}
            />
          </Box>
          {source.health.lastErrorSummary ? (
            <Alert severity="warning">
              {source.health.lastErrorCode
                ? `${source.health.lastErrorCode}: `
                : ''}
              {source.health.lastErrorSummary}
            </Alert>
          ) : null}
          {source.notes ? (
            <div>
              <Typography variant="overline">Internal notes</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {source.notes}
              </Typography>
            </div>
          ) : null}
        </Stack>
      </Paper>
      {editing && isAdmin ? (
        <Box sx={{ mb: 3 }}>
          <SourceForm
            source={source}
            error={update.error}
            isSubmitting={update.isPending}
            onSubmit={async (input) => {
              await update.mutateAsync(input);
              setEditing(false);
            }}
          />
        </Box>
      ) : null}
      {result ? (
        <Box sx={{ mb: 3 }}>
          <IngestionResultPanel result={result} />
        </Box>
      ) : null}
      <Paper
        component="section"
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Typography component="h2" variant="h4">
          Recent runs
        </Typography>
        <Stack divider={<Divider flexItem />} sx={{ mt: 2 }}>
          {recentRuns.length ? (
            recentRuns.map((run) => (
              <Stack
                key={run.id}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                sx={{ py: 1.5, justifyContent: 'space-between' }}
              >
                <div>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <RunStatusChip status={run.status} />
                    <Typography>{formatInboxDate(run.startedAt)}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Fetched {run.fetchedCount} · Created {run.createdCount} ·
                    Updated {run.updatedCount} · Skipped {run.skippedCount} ·
                    Failed {run.failedCount}
                  </Typography>
                  {run.errorSummary ? (
                    <Typography variant="body2" color="error">
                      {run.errorSummary}
                    </Typography>
                  ) : null}
                </div>
                <Typography variant="body2">
                  Initiated by {run.initiatedBySnapshot}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography color="text.secondary">
              No ingestion runs have been recorded.
            </Typography>
          )}
        </Stack>
      </Paper>
      <Dialog
        open={confirmIngest}
        onClose={() => setConfirmIngest(false)}
        aria-labelledby="confirm-ingestion-title"
      >
        <DialogTitle id="confirm-ingestion-title">
          Run ingestion now?
        </DialogTitle>
        <DialogContent>
          <Typography>
            This will fetch the feed and may create or update private editorial
            candidates. It never publishes articles.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmIngest(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmIngest(false);
              ingest.mutate(undefined, { onSuccess: setResult });
            }}
          >
            Run ingestion
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Info = ({
  label,
  value,
  link = false,
}: {
  readonly label: string;
  readonly value: string | null;
  readonly link?: boolean;
}) => (
  <div>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    {link && value ? (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        {value}
        <OpenInNewRounded fontSize="inherit" />
      </Link>
    ) : (
      <Typography>{value ?? 'Not configured'}</Typography>
    )}
  </div>
);
