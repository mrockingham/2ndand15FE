import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { getPowerRankingsErrorMessage } from '@/features/powerRankings/errors';
import {
  movementDisplay,
  movementToneColor,
} from '@/features/powerRankings/presentation';
import {
  useAdminPowerRankingEditionQuery,
  usePublishEditionMutation,
  useReorderEntriesMutation,
  useUnpublishEditionMutation,
  useUpdateEditionMutation,
  useUpdateEntryMutation,
} from '@/features/powerRankings/queries';
import { POWER_RANKING_TIERS } from '@/features/powerRankings/types';
import type {
  AdminPowerRankingEntry,
  PowerRankingEditionStatus,
} from '@/features/powerRankings/types';

const statusColor: Readonly<
  Record<PowerRankingEditionStatus, 'default' | 'success' | 'warning'>
> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
};

const listToLines = (values: readonly string[]) => values.join('\n');
const linesToList = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

const EditionMetadataForm = ({ editionId }: { readonly editionId: string }) => {
  const query = useAdminPowerRankingEditionQuery(editionId);
  const update = useUpdateEditionMutation(editionId);
  const edition = query.data?.edition;
  const [fields, setFields] = useState<{
    readonly title: string;
    readonly subtitle: string;
    readonly asOf: string;
    readonly methodology: string;
    readonly sources: string;
  } | null>(null);

  if (!edition) return null;
  const current = fields ?? {
    title: edition.title,
    subtitle: edition.subtitle,
    asOf: edition.asOf.slice(0, 10),
    methodology: edition.methodology,
    sources: listToLines(edition.sources),
  };
  const dirty = fields !== null;

  const save = async () => {
    await update.mutateAsync({
      title: current.title.trim(),
      subtitle: current.subtitle.trim(),
      asOf: current.asOf,
      methodology: current.methodology,
      sources: linesToList(current.sources),
    });
    setFields(null);
  };

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography component="h2" variant="h6" sx={{ flex: 1 }}>
            Edition details
          </Typography>
          <Chip
            size="small"
            label={edition.status}
            color={statusColor[edition.status]}
          />
        </Stack>
        <TextField
          label="Title"
          value={current.title}
          onChange={(event) =>
            setFields({ ...current, title: event.target.value })
          }
        />
        <TextField
          label="Subtitle"
          value={current.subtitle}
          onChange={(event) =>
            setFields({ ...current, subtitle: event.target.value })
          }
        />
        <TextField
          label="As of"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={current.asOf}
          onChange={(event) =>
            setFields({ ...current, asOf: event.target.value })
          }
        />
        <TextField
          label="Methodology"
          multiline
          minRows={3}
          value={current.methodology}
          onChange={(event) =>
            setFields({ ...current, methodology: event.target.value })
          }
        />
        <TextField
          label="Sources (one per line)"
          multiline
          minRows={2}
          value={current.sources}
          onChange={(event) =>
            setFields({ ...current, sources: event.target.value })
          }
        />
        {update.error ? (
          <Alert severity="error">
            {getPowerRankingsErrorMessage(update.error)}
          </Alert>
        ) : null}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            disabled={!dirty || update.isPending}
            onClick={() => void save()}
          >
            {update.isPending ? 'Saving…' : 'Save details'}
          </Button>
          {dirty ? (
            <Button onClick={() => setFields(null)} disabled={update.isPending}>
              Discard changes
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
};

const PublishControls = ({ editionId }: { readonly editionId: string }) => {
  const query = useAdminPowerRankingEditionQuery(editionId);
  const publish = usePublishEditionMutation(editionId);
  const unpublish = useUnpublishEditionMutation(editionId);
  const edition = query.data?.edition;
  if (!edition) return null;
  const mutation = edition.status === 'PUBLISHED' ? unpublish : publish;
  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={1.5}>
        <Typography component="h2" variant="h6">
          Publication
        </Typography>
        <Typography color="text.secondary">
          Status: <strong>{edition.status}</strong>
          {edition.publishedAt
            ? ` · Published ${new Date(edition.publishedAt).toLocaleString()}`
            : ''}
        </Typography>
        {mutation.error ? (
          <Alert severity="error">
            {getPowerRankingsErrorMessage(mutation.error)}
          </Alert>
        ) : null}
        <Box>
          {edition.status === 'PUBLISHED' ? (
            <Button
              variant="contained"
              color="warning"
              disabled={unpublish.isPending}
              onClick={() => unpublish.mutate()}
            >
              {unpublish.isPending ? 'Unpublishing…' : 'Unpublish'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              disabled={publish.isPending}
              onClick={() => publish.mutate()}
            >
              {publish.isPending ? 'Publishing…' : 'Publish'}
            </Button>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

const EditEntryDialog = ({
  editionId,
  entry,
  onClose,
}: {
  readonly editionId: string;
  readonly entry: AdminPowerRankingEntry | null;
  readonly onClose: () => void;
}) => {
  const update = useUpdateEntryMutation(editionId, entry?.id ?? '');
  const [fields, setFields] = useState<{
    readonly tier: string;
    readonly headline: string;
    readonly summary: string;
    readonly strengths: string;
    readonly concerns: string;
  } | null>(null);

  if (!entry) return null;
  const current = fields ?? {
    tier: entry.tier,
    headline: entry.headline,
    summary: entry.summary,
    strengths: listToLines(entry.strengths),
    concerns: listToLines(entry.concerns),
  };

  const submit = async () => {
    await update.mutateAsync({
      tier: current.tier,
      headline: current.headline,
      summary: current.summary,
      strengths: linesToList(current.strengths),
      concerns: linesToList(current.concerns),
    });
    setFields(null);
    onClose();
  };

  const close = () => {
    setFields(null);
    update.reset();
    onClose();
  };

  return (
    <Dialog open={entry !== null} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        #{entry.rank} — {entry.team.name}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Tier"
            value={current.tier}
            onChange={(event) =>
              setFields({ ...current, tier: event.target.value })
            }
          >
            {POWER_RANKING_TIERS.map((tier) => (
              <MenuItem key={tier} value={tier}>
                {tier}
              </MenuItem>
            ))}
            {!POWER_RANKING_TIERS.includes(
              current.tier as (typeof POWER_RANKING_TIERS)[number],
            ) ? (
              <MenuItem value={current.tier}>{current.tier}</MenuItem>
            ) : null}
          </TextField>
          <TextField
            label="Headline"
            value={current.headline}
            onChange={(event) =>
              setFields({ ...current, headline: event.target.value })
            }
          />
          <TextField
            label="Summary"
            multiline
            minRows={3}
            value={current.summary}
            onChange={(event) =>
              setFields({ ...current, summary: event.target.value })
            }
          />
          <TextField
            label="Strengths (one per line)"
            multiline
            minRows={2}
            value={current.strengths}
            onChange={(event) =>
              setFields({ ...current, strengths: event.target.value })
            }
          />
          <TextField
            label="Concerns (one per line)"
            multiline
            minRows={2}
            value={current.concerns}
            onChange={(event) =>
              setFields({ ...current, concerns: event.target.value })
            }
          />
          {update.error ? (
            <Alert severity="error">
              {getPowerRankingsErrorMessage(update.error)}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={update.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={update.isPending}
          onClick={() => void submit()}
        >
          {update.isPending ? 'Saving…' : 'Save entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EntryRow = ({
  entry,
  index,
  total,
  isReordering,
  onMoveUp,
  onMoveDown,
  onEdit,
}: {
  readonly entry: AdminPowerRankingEntry;
  readonly index: number;
  readonly total: number;
  readonly isReordering: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onEdit: () => void;
}) => {
  const movement = movementDisplay(entry.movement, entry.previousRank);
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ width: 32 }}>
          {entry.rank}
        </Typography>
        <TeamHelmet team={entry.team.abbreviation} size="sm" decorative />
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>{entry.team.name}</Typography>
            <Chip
              size="small"
              label={movement.label}
              sx={{ color: movementToneColor[movement.tone] }}
              variant="outlined"
            />
            <Chip size="small" label={entry.tier} />
          </Stack>
          <Typography noWrap color="text.secondary" variant="body2">
            {entry.headline}
          </Typography>
        </Stack>
        <IconButton aria-label={`Edit ${entry.team.name}`} onClick={onEdit}>
          <EditRounded fontSize="small" />
        </IconButton>
        <Stack direction="column" spacing={0.5}>
          <IconButton
            aria-label={`Move ${entry.team.name} up`}
            size="small"
            disabled={index === 0 || isReordering}
            onClick={onMoveUp}
          >
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Move ${entry.team.name} down`}
            size="small"
            disabled={index === total - 1 || isReordering}
            onClick={onMoveDown}
          >
            <ArrowDownwardRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

const EntriesSection = ({ editionId }: { readonly editionId: string }) => {
  const query = useAdminPowerRankingEditionQuery(editionId);
  const reorder = useReorderEntriesMutation(editionId);
  const [editing, setEditing] = useState<AdminPowerRankingEntry | null>(null);

  const entries = [...(query.data?.entries ?? [])].sort(
    (a, b) => a.rank - b.rank,
  );
  const orderedIds = entries.map((entry) => entry.id);

  const move = (entry: AdminPowerRankingEntry, direction: 'up' | 'down') => {
    const index = orderedIds.indexOf(entry.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;
    const next = [...orderedIds];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved!);
    reorder.mutate({ entryIds: next });
  };

  return (
    <Stack spacing={1.5}>
      <Typography component="h2" variant="h6">
        Rankings ({entries.length})
      </Typography>
      {reorder.error ? (
        <Alert severity="error">
          {getPowerRankingsErrorMessage(reorder.error)}
        </Alert>
      ) : null}
      {entries.map((entry, index) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          index={index}
          total={entries.length}
          isReordering={reorder.isPending}
          onMoveUp={() => move(entry, 'up')}
          onMoveDown={() => move(entry, 'down')}
          onEdit={() => setEditing(entry)}
        />
      ))}
      <EditEntryDialog
        editionId={editionId}
        entry={editing}
        onClose={() => setEditing(null)}
      />
    </Stack>
  );
};

export const AdminPowerRankingsEditorPage = () => {
  const navigate = useNavigate();
  const editionId = useParams().editionId ?? '';
  const query = useAdminPowerRankingEditionQuery(editionId);

  if (query.isPending) return <AdminLoading label="Loading edition" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  return (
    <>
      <AdminPageHeader
        title={query.data.edition.title}
        description="Edit metadata and entries. Publishing is a separate, explicit action."
        action={
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/power-rankings')}
          >
            Back to editions
          </Button>
        }
      />
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          }}
        >
          <EditionMetadataForm editionId={editionId} />
          <PublishControls editionId={editionId} />
        </Box>
        <EntriesSection editionId={editionId} />
      </Stack>
    </>
  );
};
