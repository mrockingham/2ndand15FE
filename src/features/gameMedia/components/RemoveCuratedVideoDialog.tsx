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
import type { CuratedVideo } from '@/features/gameMedia/types';

export const RemoveCuratedVideoDialog = ({
  video,
  isPending,
  error,
  onClose,
  onConfirm,
}: {
  readonly video: CuratedVideo | null;
  readonly isPending: boolean;
  readonly error?: unknown;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}) => (
  <Dialog
    open={video !== null}
    onClose={isPending ? undefined : onClose}
    fullWidth
    maxWidth="sm"
    aria-labelledby="remove-curated-video-title"
  >
    <DialogTitle id="remove-curated-video-title">
      Remove curated video?
    </DialogTitle>
    <DialogContent>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getGameMediaErrorMessage(error)}
        </Alert>
      ) : null}
      <Typography>
        This only removes the manual Game Center video. Automatic Highlightly
        media will not be deleted. If this is the only curated video, Game
        Center will automatically fall back to showing the automatic highlight.
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
        {isPending ? 'Removing…' : 'Remove video'}
      </Button>
    </DialogActions>
  </Dialog>
);
