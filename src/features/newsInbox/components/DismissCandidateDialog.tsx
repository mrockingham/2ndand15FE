import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';

export const DismissCandidateDialog = ({
  open,
  error,
  isPending,
  onClose,
  onDismiss,
}: {
  readonly open: boolean;
  readonly error?: unknown;
  readonly isPending: boolean;
  readonly onClose: () => void;
  readonly onDismiss: (reason: string) => Promise<void> | void;
}) => {
  const [reason, setReason] = useState('');
  const close = () => {
    setReason('');
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="dismiss-candidate-title"
    >
      <DialogTitle id="dismiss-candidate-title">
        Dismiss this candidate?
      </DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getNewsInboxErrorMessage(error)}
          </Alert>
        ) : null}
        <TextField
          autoFocus
          required
          fullWidth
          multiline
          minRows={3}
          label="Dismissal reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={reason.length > 500}
          helperText={`${reason.length}/500 · Recorded for editorial accountability.`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={
            isPending ||
            reason.trim().length === 0 ||
            reason.trim().length > 500
          }
          onClick={() => void onDismiss(reason.trim())}
        >
          {isPending ? 'Dismissing…' : 'Dismiss candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
