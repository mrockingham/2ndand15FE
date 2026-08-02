import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { getAdminErrorMessage } from '@/features/admin/errorMessages';
import {
  useDeleteOverrideMutation,
  useOverrideMutation,
  useRefreshRoleOnForbidden,
} from '@/features/admin/queries';
import type {
  AdminGame,
  GameOverrideInput,
  GameStatus,
} from '@/features/admin/types';
import type { UserRole } from '@/features/users/types';

interface OverrideValues {
  startTime: string;
  status: GameStatus | '';
  week: string;
  venueName: string;
  venueCity: string;
  broadcastNetwork: string;
  neutralMode: '' | 'true' | 'false';
  publicCorrectionNote: string;
  internalNote: string;
}

const statuses: readonly GameStatus[] = [
  'SCHEDULED',
  'PREGAME',
  'IN_PROGRESS',
  'HALFTIME',
  'FINAL',
  'POSTPONED',
  'CANCELED',
  'SUSPENDED',
];
const isoLocal = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : '';

export const OverrideForm = ({
  game,
  role,
}: {
  readonly game: AdminGame;
  readonly role: UserRole;
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutation = useOverrideMutation(game.id);
  const deleteMutation = useDeleteOverrideMutation(game.id);
  useRefreshRoleOnForbidden(mutation.error ?? deleteMutation.error);
  const { control, register, handleSubmit } = useForm<OverrideValues>({
    defaultValues: {
      startTime: isoLocal(game.override?.startTime ?? null),
      status: game.override?.status ?? '',
      week:
        game.override?.week === null || game.override?.week === undefined
          ? ''
          : String(game.override.week),
      venueName: game.override?.venueName ?? '',
      venueCity: game.override?.venueCity ?? '',
      broadcastNetwork: game.override?.broadcastNetwork ?? '',
      neutralMode:
        game.override?.isNeutralSite === null ||
        game.override?.isNeutralSite === undefined
          ? ''
          : (String(game.override.isNeutralSite) as 'true' | 'false'),
      publicCorrectionNote: game.override?.publicCorrectionNote ?? '',
      internalNote: game.override?.internalNote ?? '',
    },
  });
  const preview = useWatch({ control });
  const submit = handleSubmit(async (values) => {
    const input: GameOverrideInput = {
      startTime: values.startTime
        ? new Date(`${values.startTime}:00Z`).toISOString()
        : null,
      status: values.status || null,
      week: values.week ? Number(values.week) : null,
      venueName: values.venueName.trim() || null,
      venueCity: values.venueCity.trim() || null,
      broadcastNetwork: values.broadcastNetwork.trim() || null,
      isNeutralSite:
        values.neutralMode === '' ? null : values.neutralMode === 'true',
      publicCorrectionNote: values.publicCorrectionNote.trim() || null,
      internalNote: values.internalNote.trim() || null,
    };
    await mutation.mutateAsync(input);
  });
  return (
    <Paper
      component="form"
      onSubmit={(event) => void submit(event)}
      variant="outlined"
      sx={{ p: 2.5 }}
    >
      <Stack spacing={2}>
        <Typography variant="h5">Editorial override</Typography>
        <Alert severity="info">
          Blank fields fall back to the base game value. Saving a blank field
          clears only that field’s override. Kickoff overrides are entered
          explicitly in UTC.
        </Alert>
        {mutation.error || deleteMutation.error ? (
          <Alert severity="error">
            {getAdminErrorMessage(mutation.error ?? deleteMutation.error)}
          </Alert>
        ) : null}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Kickoff override (UTC)"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startTime')}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="override-status-label">
                  Status override
                </InputLabel>
                <Select
                  {...field}
                  labelId="override-status-label"
                  label="Status override"
                >
                  <MenuItem value="">
                    <em>Base value</em>
                  </MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <TextField
            fullWidth
            label="Week override"
            type="number"
            slotProps={{ htmlInput: { min: 1, max: 22 } }}
            {...register('week')}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Venue name override"
            {...register('venueName')}
          />
          <TextField
            fullWidth
            label="Venue city override"
            {...register('venueCity')}
          />
          <TextField
            fullWidth
            label="Broadcast override"
            {...register('broadcastNetwork')}
          />
        </Stack>
        <Controller
          name="neutralMode"
          control={control}
          render={({ field }) => (
            <FormControl>
              <InputLabel id="neutral-label">Neutral-site override</InputLabel>
              <Select
                {...field}
                labelId="neutral-label"
                label="Neutral-site override"
              >
                <MenuItem value="">Base value</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <TextField
          label="Public correction note"
          multiline
          minRows={2}
          {...register('publicCorrectionNote')}
        />
        <TextField
          label="Internal note"
          multiline
          minRows={2}
          {...register('internalNote')}
        />
        <Alert severity="success" icon={false}>
          <strong>Resolved preview:</strong> Week{' '}
          {preview.week || game.base.week || '—'} ·{' '}
          {preview.status || game.base.status} ·{' '}
          {preview.venueName || game.base.venue.name || 'Venue TBD'} ·{' '}
          {preview.broadcastNetwork ||
            game.base.broadcastNetwork ||
            'Network TBD'}
        </Alert>
        <Stack direction="row" spacing={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save override'}
          </Button>
          {game.override && role === 'ADMIN' ? (
            <Button color="error" onClick={() => setConfirmDelete(true)}>
              Delete override
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete-override-title"
      >
        <DialogTitle id="delete-override-title">
          Delete editorial override?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            All resolved schedule values will immediately fall back to the base
            game.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            color="error"
            disabled={deleteMutation.isPending}
            onClick={async () => {
              await deleteMutation.mutateAsync();
              setConfirmDelete(false);
            }}
          >
            Delete override
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
