import { CircularProgress, Stack, Typography } from '@mui/material';

export const RouteLoading = () => (
  <Stack
    role="status"
    spacing={2}
    sx={{ minHeight: 280, alignItems: 'center', justifyContent: 'center' }}
  >
    <CircularProgress />
    <Typography>Loading page…</Typography>
  </Stack>
);
