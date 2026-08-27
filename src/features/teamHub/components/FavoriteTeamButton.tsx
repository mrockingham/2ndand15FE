import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import { Alert, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getFavoriteTeamErrorMessage } from '@/features/teams/favoriteTeamErrors';
import { useFavoriteTeamMutation } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

export const FavoriteTeamButton = ({
  teamId,
  teamName,
  compact = false,
}: {
  readonly teamId: string;
  readonly teamName: string;
  readonly compact?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useFavoriteTeamMutation();
  const currentUser = useCurrentUserQuery().data;
  const authenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );
  const [error, setError] = useState<string | null>(null);
  const selected = currentUser?.favoriteTeam?.id === teamId;
  const save = async () => {
    if (!authenticated) {
      await navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }
    if (selected || mutation.isPending) return;
    setError(null);
    try {
      await mutation.mutateAsync(teamId);
    } catch (caught: unknown) {
      setError(getFavoriteTeamErrorMessage(caught));
    }
  };

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button
        size={compact ? 'small' : 'medium'}
        variant={selected ? 'contained' : 'outlined'}
        startIcon={selected ? <FavoriteRounded /> : <FavoriteBorderRounded />}
        disabled={selected || mutation.isPending}
        onClick={() => void save()}
        aria-label={
          selected
            ? `${teamName} is your favorite team`
            : `Set ${teamName} as favorite team`
        }
      >
        {selected
          ? 'Favorite team'
          : mutation.isPending
            ? 'Saving…'
            : currentUser?.favoriteTeam
              ? 'Replace favorite'
              : 'Set favorite'}
      </Button>
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );
};
