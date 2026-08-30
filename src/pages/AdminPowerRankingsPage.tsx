import AddRounded from '@mui/icons-material/AddRounded';
import UploadFileRounded from '@mui/icons-material/UploadFileRounded';
import {
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { getPowerRankingsErrorMessage } from '@/features/powerRankings/errors';
import { formatAsOfDate } from '@/features/powerRankings/presentation';
import {
  useAdminPowerRankingEditionsQuery,
  useCreateEditionMutation,
  usePublishEditionMutation,
  useUnpublishEditionMutation,
} from '@/features/powerRankings/queries';
import type {
  AdminPowerRankingEdition,
  PowerRankingEditionStatus,
} from '@/features/powerRankings/types';

const statusColor: Readonly<
  Record<PowerRankingEditionStatus, 'default' | 'success' | 'warning'>
> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
};

interface CreateEditionFields {
  readonly title: string;
  readonly subtitle: string;
  readonly season: string;
  readonly edition: string;
  readonly asOf: string;
  readonly methodology: string;
}

const emptyCreateFields: CreateEditionFields = {
  title: '',
  subtitle: '',
  season: String(new Date().getFullYear()),
  edition: '',
  asOf: new Date().toISOString().slice(0, 10),
  methodology: '',
};

// Matches the backend's required slug format, e.g. "preseason" or "week-1".
const editionSlugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const CreateEditionDialog = ({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<CreateEditionFields>(emptyCreateFields);
  const create = useCreateEditionMutation();
  const canSubmit =
    fields.title.trim() !== '' &&
    fields.subtitle.trim() !== '' &&
    editionSlugPattern.test(fields.edition.trim()) &&
    fields.asOf.trim() !== '' &&
    fields.methodology.trim() !== '' &&
    Number.isInteger(Number(fields.season));

  const close = () => {
    setFields(emptyCreateFields);
    create.reset();
    onClose();
  };

  const submit = async () => {
    const result = await create.mutateAsync({
      title: fields.title.trim(),
      subtitle: fields.subtitle.trim(),
      season: Number(fields.season),
      edition: fields.edition.trim(),
      asOf: fields.asOf,
      methodology: fields.methodology.trim(),
      sources: [],
    });
    close();
    navigate(`/admin/power-rankings/${result.edition.id}`);
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Create Power Rankings edition</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            required
            label="Title"
            value={fields.title}
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                title: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Subtitle"
            value={fields.subtitle}
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                subtitle: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Season"
            type="number"
            value={fields.season}
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                season: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Edition"
            placeholder="preseason, week-3, …"
            value={fields.edition}
            error={
              fields.edition.trim() !== '' &&
              !editionSlugPattern.test(fields.edition.trim())
            }
            helperText='Lowercase slug, e.g. "preseason" or "week-1".'
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                edition: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="As of"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={fields.asOf}
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                asOf: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Methodology"
            multiline
            minRows={3}
            value={fields.methodology}
            onChange={(event) =>
              setFields((previous) => ({
                ...previous,
                methodology: event.target.value,
              }))
            }
          />
          {create.error ? (
            <Alert severity="error">
              {getPowerRankingsErrorMessage(create.error)}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={create.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || create.isPending}
          onClick={() => void submit()}
        >
          {create.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type PendingPublishAction = {
  readonly type: 'publish' | 'unpublish';
  readonly edition: AdminPowerRankingEdition;
} | null;

const PublishConfirmDialog = ({
  action,
  onClose,
}: {
  readonly action: PendingPublishAction;
  readonly onClose: () => void;
}) => {
  const publish = usePublishEditionMutation(action?.edition.id ?? '');
  const unpublish = useUnpublishEditionMutation(action?.edition.id ?? '');
  const mutation = action?.type === 'publish' ? publish : unpublish;
  return (
    <Dialog open={action !== null} onClose={onClose}>
      <DialogTitle>
        {action?.type === 'publish' ? 'Publish edition?' : 'Unpublish edition?'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {action?.type === 'publish'
            ? `This makes "${action.edition.title}" visible on the public Power Rankings page.`
            : `This removes "${action?.edition.title}" from the public Power Rankings page.`}
        </DialogContentText>
        {mutation.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getPowerRankingsErrorMessage(mutation.error)}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={action?.type === 'publish' ? 'success' : 'warning'}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(undefined, { onSuccess: onClose })}
        >
          {mutation.isPending
            ? 'Saving…'
            : action?.type === 'publish'
              ? 'Publish'
              : 'Unpublish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditionCard = ({
  edition,
  onPublish,
  onUnpublish,
}: {
  readonly edition: AdminPowerRankingEdition;
  readonly onPublish: () => void;
  readonly onUnpublish: () => void;
}) => (
  <Card variant="outlined">
    <CardActionArea
      component={RouterLink}
      to={`/admin/power-rankings/${edition.id}`}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Chip
            size="small"
            label={edition.status}
            color={statusColor[edition.status]}
          />
          <Typography variant="overline" color="text.secondary">
            {edition.season} · {edition.edition}
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {edition.title}
        </Typography>
        <Typography color="text.secondary">
          {edition.subtitle} · As of {formatAsOfDate(edition.asOf)}
        </Typography>
      </CardContent>
    </CardActionArea>
    <CardContent sx={{ pt: 0 }}>
      <Stack direction="row" spacing={1}>
        {edition.status === 'PUBLISHED' ? (
          <Button size="small" color="warning" onClick={onUnpublish}>
            Unpublish
          </Button>
        ) : (
          <Button size="small" color="success" onClick={onPublish}>
            Publish
          </Button>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export const AdminPowerRankingsPage = () => {
  const query = useAdminPowerRankingEditionsQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingPublish, setPendingPublish] =
    useState<PendingPublishAction>(null);

  return (
    <>
      <AdminPageHeader
        title="Power Rankings"
        description="Manage Power Rankings editions, entries, and publication state."
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              to="/admin/power-rankings/import"
              variant="outlined"
              startIcon={<UploadFileRounded />}
            >
              Import JSON
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setCreateOpen(true)}
            >
              Create edition
            </Button>
          </Stack>
        }
      />
      {query.isPending ? <AdminLoading label="Loading editions" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data?.length === 0 ? (
        <AdminEmpty
          title="No Power Rankings editions yet"
          description="Create an edition or import one from JSON to get started."
        />
      ) : null}
      {query.data?.length ? (
        <Stack spacing={1.5}>
          {query.data.map((edition) => (
            <EditionCard
              key={edition.id}
              edition={edition}
              onPublish={() => setPendingPublish({ type: 'publish', edition })}
              onUnpublish={() =>
                setPendingPublish({ type: 'unpublish', edition })
              }
            />
          ))}
        </Stack>
      ) : null}
      <CreateEditionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <PublishConfirmDialog
        action={pendingPublish}
        onClose={() => setPendingPublish(null)}
      />
    </>
  );
};
