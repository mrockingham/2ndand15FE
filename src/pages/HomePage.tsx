import { Alert, Box, Button, Container, Skeleton, Stack } from '@mui/material';

import { PersonalizedHome } from '@/features/home/components/PersonalizedHome';
import { PublicHome } from '@/features/home/components/PublicHome';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

const AuthenticatedHomeLoading = () => (
  <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Stack spacing={3} aria-busy="true" aria-label="Loading your Home">
      <Skeleton variant="rounded" height={360} />
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        }}
      >
        <Skeleton variant="rounded" height={340} />
        <Skeleton variant="rounded" height={340} />
      </Box>
    </Stack>
  </Container>
);

export const HomePage = () => {
  const isAuthenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );
  const currentUserQuery = useCurrentUserQuery();

  if (!isAuthenticated) return <PublicHome />;
  if (currentUserQuery.isPending) return <AuthenticatedHomeLoading />;
  if (currentUserQuery.isError || currentUserQuery.data === undefined) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => void currentUserQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          We couldn’t load your Home identity. Try again while the public routes
          remain available.
        </Alert>
      </Container>
    );
  }

  const user = currentUserQuery.data;
  if (user.favoriteTeam === null) return <PublicHome chooseTeam />;

  return (
    <PersonalizedHome
      displayName={user.displayName?.trim() || 'NFL fan'}
      favoriteTeam={user.favoriteTeam}
    />
  );
};
