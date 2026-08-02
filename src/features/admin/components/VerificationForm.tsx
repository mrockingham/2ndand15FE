import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getAdminErrorMessage } from '@/features/admin/errorMessages';
import {
  useRefreshRoleOnForbidden,
  useVerifyGameMutation,
} from '@/features/admin/queries';
import type { AdminGame, VerificationInput } from '@/features/admin/types';

export const VerificationForm = ({ game }: { readonly game: AdminGame }) => {
  const mutation = useVerifyGameMutation(game.id);
  useRefreshRoleOnForbidden(mutation.error);
  const [pendingWithoutUrl, setPendingWithoutUrl] =
    useState<VerificationInput | null>(null);
  const { register, handleSubmit } = useForm<{
    sourceName: string;
    sourceUrl: string;
    note: string;
  }>({
    defaultValues: {
      sourceName: game.provenance?.sourceName ?? '',
      sourceUrl: game.provenance?.sourceUrl ?? '',
      note: game.provenance?.notes ?? '',
    },
  });
  const verify = async (input: VerificationInput) => {
    await mutation.mutateAsync(input);
  };
  const submit = handleSubmit(async (values) => {
    const input: VerificationInput = {
      sourceName: values.sourceName.trim(),
      sourceUrl: values.sourceUrl.trim() || null,
      note: values.note.trim() || null,
    };
    if (!input.sourceUrl) setPendingWithoutUrl(input);
    else await verify(input);
  });
  return (
    <Paper
      component="form"
      onSubmit={(event) => void submit(event)}
      variant="outlined"
      sx={{ p: 2.5 }}
    >
      <Stack spacing={2}>
        <Typography variant="h5">Verification</Typography>
        <Alert severity={game.provenance?.verifiedAt ? 'success' : 'warning'}>
          {game.provenance?.verifiedAt
            ? `Verified ${new Date(game.provenance.verifiedAt).toLocaleString()}.`
            : 'This schedule record is unverified.'}{' '}
          Editing base or override fields may clear verification. Verification
          does not grant content or trademark rights.
        </Alert>
        {mutation.error ? (
          <Alert severity="error">{getAdminErrorMessage(mutation.error)}</Alert>
        ) : null}
        <TextField
          required
          label="Verification source name"
          {...register('sourceName', { required: true })}
        />
        <TextField
          label="Verification source URL"
          type="url"
          {...register('sourceUrl')}
        />
        <TextField
          label="Verification note"
          multiline
          minRows={2}
          {...register('note')}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          {mutation.isPending ? 'Verifying…' : 'Mark verified'}
        </Button>
      </Stack>
      <Dialog
        open={pendingWithoutUrl !== null}
        onClose={() => setPendingWithoutUrl(null)}
        aria-labelledby="verify-without-url-title"
      >
        <DialogTitle id="verify-without-url-title">
          Verify without a source URL?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            A source name is present, but no source URL will be recorded.
            Confirm only if you independently checked the schedule.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingWithoutUrl(null)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (pendingWithoutUrl) await verify(pendingWithoutUrl);
              setPendingWithoutUrl(null);
            }}
          >
            Verify anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
