import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { getPostAuthenticationNavigation } from '@/features/auth/postAuthenticationNavigation';
import { userKeys } from '@/features/users/queryKeys';
import type { CurrentUser } from '@/features/users/types';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

export const RequireAuthentication = () => {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.restorationStatus);

  if (status !== 'authenticated' || accessToken === null) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return <Outlet />;
};

export const PublicOnlyAuthentication = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.restorationStatus);

  if (status === 'authenticated' && accessToken !== null) {
    const user = queryClient.getQueryData<CurrentUser>(userKeys.me);
    if (user !== undefined) {
      const destination = getPostAuthenticationNavigation(user, location.state);
      return (
        <Navigate to={destination.pathname} replace state={destination.state} />
      );
    }
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
};

export const RequireAdministrativeRole = ({
  adminOnly = false,
}: {
  adminOnly?: boolean;
}) => {
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isPending) {
    return (
      <Box
        role="status"
        aria-label="Checking administrative permissions"
        sx={{ p: 6, textAlign: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const role = currentUserQuery.data?.role;
  const allowed = adminOnly
    ? role === 'ADMIN'
    : role === 'EDITOR' || role === 'ADMIN';
  return allowed ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ adminDenied: true }} />
  );
};
