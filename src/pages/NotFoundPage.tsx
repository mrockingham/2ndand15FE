import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const NotFoundPage = () => (
  <Container
    maxWidth="md"
    sx={{
      display: 'grid',
      minHeight: { xs: '60vh', md: '70vh' },
      placeItems: 'center',
      py: 8,
      textAlign: 'center',
    }}
  >
    <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
      <Typography variant="overline" color="primary.light">
        404 · OFF THE FIELD
      </Typography>
      <Typography variant="h2" component="h1">
        This route missed the mark.
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 540 }}>
        The page may have moved, or it may belong to a future 2nd &amp; 15
        milestone.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        startIcon={<ArrowBackRounded />}
      >
        Return home
      </Button>
    </Stack>
  </Container>
);
