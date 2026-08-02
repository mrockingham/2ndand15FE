import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import { getAdminErrorMessage } from '@/features/admin/errorMessages';

export const AdminLoading = ({
  label = 'Loading schedule data',
}: {
  readonly label?: string;
}) => (
  <Stack
    role="status"
    direction="row"
    spacing={2}
    sx={{ minHeight: 240, alignItems: 'center', justifyContent: 'center' }}
  >
    <CircularProgress size={28} />
    <Typography>{label}…</Typography>
  </Stack>
);

export const AdminError = ({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry?: () => void;
}) => (
  <Alert
    severity="error"
    icon={<ErrorOutlineRounded />}
    action={
      onRetry ? (
        <Button color="inherit" onClick={onRetry}>
          Retry
        </Button>
      ) : undefined
    }
  >
    {getAdminErrorMessage(error)}
  </Alert>
);

export const AdminEmpty = ({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) => (
  <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
    <Typography variant="h5">{title}</Typography>
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      {description}
    </Typography>
  </Box>
);
