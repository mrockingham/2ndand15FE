import { Button, Container, Stack, Typography } from '@mui/material';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const RouteErrorPage = () => {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'An unexpected route error occurred.';

  return (
    <Container
      maxWidth="sm"
      sx={{ display: 'grid', minHeight: '70vh', placeItems: 'center', py: 6 }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h3" component="h1">
          We lost the route.
        </Typography>
        <Typography color="text.secondary">{message}</Typography>
        <Button variant="contained" onClick={() => window.location.assign('/')}>
          Return home
        </Button>
      </Stack>
    </Container>
  );
};
