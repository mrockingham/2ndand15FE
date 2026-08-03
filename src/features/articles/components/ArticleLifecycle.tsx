import {
  Alert,
  Button,
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
import type {
  AdminArticleDetail,
  ArticleLifecycleAction,
} from '@/features/articles/types';
import {
  useArticleLifecycleMutation,
  useScheduleArticleMutation,
} from '@/features/articles/queries';
import { getArticleErrorMessage } from '@/features/articles/errors';
import type { UserRole } from '@/features/users/types';
import { ApiError } from '@/services/api/apiClient';

type PendingAction = ArticleLifecycleAction | 'schedule' | null;
export const ArticleLifecycle = ({
  article,
  role,
}: {
  readonly article: AdminArticleDetail;
  readonly role: UserRole;
}) => {
  const [pending, setPending] = useState<PendingAction>(null);
  const [summary, setSummary] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const publish = useArticleLifecycleMutation(article.id, 'publish');
  const unpublish = useArticleLifecycleMutation(article.id, 'unpublish');
  const archive = useArticleLifecycleMutation(article.id, 'archive');
  const restore = useArticleLifecycleMutation(article.id, 'restore');
  const schedule = useScheduleArticleMutation(article.id);
  const mutations = { publish, unpublish, archive, restore };
  const error =
    publish.error ??
    unpublish.error ??
    archive.error ??
    restore.error ??
    schedule.error;
  const execute = async () => {
    if (!pending) return;
    const changeSummary = summary.trim() || null;
    if (pending === 'schedule') {
      if (
        !/(?:Z|[+-]\d{2}:\d{2})$/.test(scheduledFor) ||
        Number.isNaN(Date.parse(scheduledFor))
      ) {
        setScheduleError(
          'Enter a valid ISO timestamp with an explicit UTC offset.',
        );
        return;
      }
      if (Date.parse(scheduledFor) <= Date.now()) {
        setScheduleError('Scheduled publication must be in the future.');
        return;
      }
    }
    const updated =
      pending === 'schedule'
        ? await schedule.mutateAsync({
            expectedVersion: article.version,
            scheduledFor,
            changeSummary,
          })
        : await mutations[pending].mutateAsync({
            expectedVersion: article.version,
            changeSummary,
          });
    if (pending === 'publish') setPublicUrl(`/news/${updated.slug}`);
    setPending(null);
    setSummary('');
    setScheduledFor('');
    setScheduleError(null);
  };
  const confirm = async () => {
    try {
      await execute();
    } catch (actionError: unknown) {
      // TanStack Mutation exposes normalized API failures through `error` above.
      if (!(actionError instanceof ApiError)) throw actionError;
    }
  };
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Publishing</Typography>
      <Alert severity="info">
        Scheduled articles become publicly visible when their timestamp is
        reached; visibility is derived by the backend without a background job.
      </Alert>
      {error ? (
        <Alert severity="error">{getArticleErrorMessage(error)}</Alert>
      ) : null}
      {publicUrl ? (
        <Alert severity="success">
          Published at <Button href={publicUrl}>open public article</Button>
        </Alert>
      ) : null}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {article.status !== 'PUBLISHED' && article.status !== 'ARCHIVED' ? (
          <Button variant="contained" onClick={() => setPending('publish')}>
            Publish now
          </Button>
        ) : null}
        {['DRAFT', 'UNPUBLISHED', 'SCHEDULED'].includes(article.status) ? (
          <Button variant="outlined" onClick={() => setPending('schedule')}>
            Schedule
          </Button>
        ) : null}
        {['PUBLISHED', 'SCHEDULED'].includes(article.status) ? (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => setPending('unpublish')}
          >
            Unpublish
          </Button>
        ) : null}
        {role === 'ADMIN' && article.status !== 'ARCHIVED' ? (
          <Button color="error" onClick={() => setPending('archive')}>
            Archive
          </Button>
        ) : null}
        {role === 'ADMIN' && article.status === 'ARCHIVED' ? (
          <Button onClick={() => setPending('restore')}>Restore</Button>
        ) : null}
      </Stack>
      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        aria-labelledby="lifecycle-title"
      >
        <DialogTitle id="lifecycle-title">Confirm {pending}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action uses article version {article.version} and creates an
            immutable revision.
          </DialogContentText>
          {pending === 'schedule' ? (
            <TextField
              autoFocus
              fullWidth
              required
              label="Scheduled publication timestamp"
              placeholder="2026-08-03T10:00:00-04:00"
              value={scheduledFor}
              onChange={(event) => {
                setScheduledFor(event.target.value);
                setScheduleError(null);
              }}
              error={scheduleError !== null}
              helperText={
                scheduleError ??
                'Enter a future ISO timestamp with an explicit UTC offset; browser timezone is not assumed.'
              }
              sx={{ mb: 2 }}
            />
          ) : null}
          <TextField
            fullWidth
            label="Change summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={pending === 'archive' ? 'error' : 'primary'}
            disabled={pending === 'schedule' && !scheduledFor}
            onClick={() => void confirm()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
