import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { getGameMediaErrorMessage } from '@/features/gameMedia/errors';

export const RemoveGlobalVideoDialog = ({
  open,
  isPending,
  error,
  onClose,
  onConfirm,
}: {
  readonly open: boolean;
  readonly isPending: boolean;
  readonly error?: unknown;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}) => (
  <Dialog
    open={open}
    onClose={isPending ? undefined : onClose}
    fullWidth
    maxWidth="sm"
    aria-labelledby="remove-global-video-title"
  >
    <DialogTitle id="remove-global-video-title">
      Remove global Game Center video?
    </DialogTitle>
    <DialogContent>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getGameMediaErrorMessage(error)}
        </Alert>
      ) : null}
      <Typography>
        Games with their own media will continue to use it. Games with no other
        media will return to having no video.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button
        color="error"
        variant="contained"
        disabled={isPending}
        onClick={onConfirm}
      >
        {isPending ? 'Removing…' : 'Remove global video'}
      </Button>
    </DialogActions>
  </Dialog>
);
