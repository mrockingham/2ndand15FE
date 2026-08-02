import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AuditEventList } from '@/features/admin/components/AuditEventList';
import { GameForm } from '@/features/admin/components/GameForm';
import { GameValuesPanel } from '@/features/admin/components/GameValuesPanel';
import { OverrideForm } from '@/features/admin/components/OverrideForm';
import { StatusChips } from '@/features/admin/components/StatusChips';
import { VerificationForm } from '@/features/admin/components/VerificationForm';
import { formatAdminDateTime } from '@/features/admin/format';
import {
  useAdminGameQuery,
  useGameAuditQuery,
  useRefreshRoleOnForbidden,
  useUpdateAdminGameMutation,
} from '@/features/admin/queries';
import type {
  ManualGameCreateInput,
  ManualGameInput,
} from '@/features/admin/types';
import { useCurrentUserQuery } from '@/features/users/queries';

export const AdminGameDetailPage = () => {
  const { gameId = '' } = useParams();
  const query = useAdminGameQuery(gameId);
  const auditQuery = useGameAuditQuery(gameId);
  const updateMutation = useUpdateAdminGameMutation(gameId);
  useRefreshRoleOnForbidden(updateMutation.error);
  const role = useCurrentUserQuery().data?.role ?? 'USER';
  if (query.isPending) return <AdminLoading label="Loading game" />;
  if (query.isError)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );
  const game = query.data;
  const manuallyEditable =
    !game.providerManaged &&
    ['MANUAL_ENTRY', 'MANUAL_IMPORT', 'OFFICIAL_WEB'].includes(
      game.provenance?.sourceType ?? '',
    );
  return (
    <>
      <Button
        component={RouterLink}
        to="/admin/games"
        startIcon={<ArrowBackRounded />}
        sx={{ mb: 2 }}
      >
        Back to games
      </Button>
      <AdminPageHeader
        title={`${game.resolved.awayTeam.abbreviation} at ${game.resolved.homeTeam.abbreviation}`}
        description={`${formatAdminDateTime(game.resolved.startTime)} · Game ${game.id}`}
        action={<StatusChips game={game} />}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <GameValuesPanel
          title="Resolved values"
          values={game.resolved}
          emphasized
        />
        <GameValuesPanel title="Base values" values={game.base} />
      </Box>
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h5">Provenance</Typography>
          <Divider sx={{ my: 2 }} />
          {game.provenance ? (
            <Stack spacing={1}>
              <Typography>
                <strong>Source type:</strong> {game.provenance.sourceType}
              </Typography>
              <Typography>
                <strong>Source name:</strong> {game.provenance.sourceName}
              </Typography>
              <Typography>
                <strong>Imported:</strong>{' '}
                {formatAdminDateTime(game.provenance.importedAt)}
              </Typography>
              <Typography>
                <strong>Verification:</strong>{' '}
                {game.provenance.verifiedAt
                  ? `Verified ${formatAdminDateTime(game.provenance.verifiedAt)}`
                  : 'Unverified'}
              </Typography>
              {game.provenance.sourceUrl ? (
                <Link
                  href={game.provenance.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open source in a new tab
                </Link>
              ) : (
                <Typography color="text.secondary">
                  No source URL recorded.
                </Typography>
              )}
              {game.provenance.externalReference ? (
                <Typography>
                  <strong>External reference:</strong>{' '}
                  {game.provenance.externalReference}
                </Typography>
              ) : null}
              {game.provenance.notes ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Notes</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {game.provenance.notes}
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No provenance record is available.
            </Typography>
          )}
        </Paper>
        {game.override ? (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h5">Current override</Typography>
              <Chip size="small" color="warning" label="Active" />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ mb: 1 }}>
              Only populated values replace the base game; blank values fall
              back.
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>Public correction:</strong>{' '}
              {game.override.publicCorrectionNote ?? '—'}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>Internal note:</strong>{' '}
              {game.override.internalNote ?? '—'}
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              Last updated by {game.override.updatedBySnapshot} on{' '}
              {formatAdminDateTime(game.override.updatedAt)}
            </Typography>
          </Paper>
        ) : null}
        {manuallyEditable ? (
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Edit base game
            </Typography>
            <GameForm
              game={game.base}
              submitLabel="Save base changes"
              error={updateMutation.error}
              isSubmitting={updateMutation.isPending}
              onSubmit={async (
                input: ManualGameCreateInput | ManualGameInput,
              ) => {
                await updateMutation.mutateAsync(input as ManualGameInput);
              }}
            />
          </Box>
        ) : (
          <Alert severity="info">
            This game is provider-managed or not manually owned. Direct base
            editing is unavailable; use an editorial override so provider
            synchronization can continue safely.
          </Alert>
        )}
        <OverrideForm game={game} role={role} />
        <VerificationForm game={game} />
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Game audit history
          </Typography>
          {auditQuery.isPending ? (
            <AdminLoading label="Loading audit history" />
          ) : null}
          {auditQuery.isError ? (
            <AdminError
              error={auditQuery.error}
              onRetry={() => void auditQuery.refetch()}
            />
          ) : null}
          {auditQuery.data?.events.length === 0 ? (
            <Typography color="text.secondary">
              No audit events have been recorded for this game.
            </Typography>
          ) : null}
          {auditQuery.data?.events ? (
            <AuditEventList events={auditQuery.data.events} />
          ) : null}
        </Box>
      </Stack>
    </>
  );
};
