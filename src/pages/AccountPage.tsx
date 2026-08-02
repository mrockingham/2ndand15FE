import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { logout } from '@/features/auth/api';
import { clearAuthentication } from '@/features/auth/session';
import { TeamIdentity } from '@/features/teams/components/TeamIdentity';
import { getFavoriteTeamErrorMessage } from '@/features/teams/favoriteTeamErrors';
import { useFavoriteTeamMutation } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useApiClients } from '@/services/api/useApiClients';

export const AccountPage = () => {
  const { publicClient } = useApiClients();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const currentUserQuery = useCurrentUserQuery();
  const favoriteMutation = useFavoriteTeamMutation();
  const logoutMutation = useMutation({
    mutationFn: () => logout(publicClient),
  });

  const handleLogout = async () => {
    const remoteLogoutSucceeded = await logoutMutation
      .mutateAsync()
      .then(() => true)
      .catch(() => false);
    clearAuthentication(queryClient);
    await navigate('/login', {
      replace: true,
      state: { loggedOut: true, remoteLogoutSucceeded },
    });
  };

  const handleClearFavorite = async () => {
    if (favoriteMutation.isPending) return;
    setFavoriteError(null);
    try {
      await favoriteMutation.mutateAsync(null);
      setClearDialogOpen(false);
    } catch (error: unknown) {
      setFavoriteError(getFavoriteTeamErrorMessage(error));
      setClearDialogOpen(false);
    }
  };

  if (currentUserQuery.isPending) {
    return (
      <Box
        aria-busy="true"
        sx={{ display: 'grid', minHeight: '55vh', placeItems: 'center' }}
      >
        <CircularProgress aria-label="Loading your account" />
      </Box>
    );
  }

  if (currentUserQuery.isError || currentUserQuery.data === undefined) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => void currentUserQuery.refetch()}>
              Retry
            </Button>
          }
        >
          We couldn’t load your account. Check your connection and try again.
        </Alert>
      </Container>
    );
  }

  const user = currentUserQuery.data;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, sm: 7, md: 9 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.light">
            YOUR HUDDLE
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            tabIndex={-1}
            sx={{ mt: 1, mb: 1.5 }}
          >
            Account
          </Typography>
          <Typography color="text.secondary">
            Your authenticated profile and personalization summary.
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <Box
                sx={{
                  display: 'grid',
                  width: 58,
                  height: 58,
                  flex: '0 0 auto',
                  placeItems: 'center',
                  borderRadius: 2,
                  color: 'primary.contrastText',
                  background: 'linear-gradient(145deg, #8A6AFF, #4A1BCB)',
                }}
              >
                <PersonRounded fontSize="large" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" component="h2">
                  {user.displayName ?? 'NFL fan'}
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
              <Chip
                icon={<ShieldRounded />}
                label="Authenticated"
                color="success"
              />
            </Stack>

            <Divider />

            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', mb: 1 }}
              >
                <SportsFootballRounded color="primary" />
                <Typography variant="h4" component="h2">
                  Favorite team
                </Typography>
              </Stack>
              {user.favoriteTeam === null ? (
                <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Typography color="text.secondary">
                    No favorite team selected
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/choose-team"
                    state={{ from: '/account' }}
                    variant="contained"
                  >
                    Select favorite team
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2.5}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                  >
                    <TeamIdentity team={user.favoriteTeam} size={68} />
                    <Box>
                      <Typography variant="h3" component="h3">
                        {user.favoriteTeam.fullName}
                      </Typography>
                      <Typography color="text.secondary">
                        {user.favoriteTeam.conference}{' '}
                        {user.favoriteTeam.division}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                    <Button
                      component={RouterLink}
                      to="/choose-team"
                      state={{ from: '/account' }}
                      variant="contained"
                    >
                      Change favorite team
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={favoriteMutation.isPending}
                      onClick={() => setClearDialogOpen(true)}
                    >
                      Clear favorite team
                    </Button>
                  </Stack>
                </Stack>
              )}
              {favoriteError === null ? null : (
                <Alert severity="error" aria-live="polite" sx={{ mt: 2 }}>
                  {favoriteError}
                </Alert>
              )}
            </Box>

            <Divider />

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutRounded />}
              disabled={logoutMutation.isPending}
              onClick={() => void handleLogout()}
              sx={{ alignSelf: { sm: 'flex-start' } }}
            >
              {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
            </Button>
          </Stack>
        </Card>
      </Stack>
      <Dialog
        open={clearDialogOpen}
        onClose={() => {
          if (!favoriteMutation.isPending) setClearDialogOpen(false);
        }}
        aria-labelledby="clear-favorite-title"
        aria-describedby="clear-favorite-description"
      >
        <DialogTitle id="clear-favorite-title">
          Clear favorite team?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-favorite-description">
            Your account will remain active, but team personalization will be
            removed until you choose another favorite.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={favoriteMutation.isPending}
            onClick={() => setClearDialogOpen(false)}
          >
            Keep team
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={favoriteMutation.isPending}
            onClick={() => void handleClearFavorite()}
          >
            {favoriteMutation.isPending ? 'Clearingâ€¦' : 'Clear favorite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
