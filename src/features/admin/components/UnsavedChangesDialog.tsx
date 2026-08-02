import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useBlocker } from 'react-router-dom';

export const UnsavedChangesDialog = ({
  dirty,
}: {
  readonly dirty: boolean;
}) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  return (
    <Dialog
      open={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      aria-labelledby="unsaved-title"
    >
      <DialogTitle id="unsaved-title">Discard unsaved changes?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your changes have not been saved. Leaving this page will discard them.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.reset?.()}>Keep editing</Button>
        <Button color="error" onClick={() => blocker.proceed?.()}>
          Discard changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
