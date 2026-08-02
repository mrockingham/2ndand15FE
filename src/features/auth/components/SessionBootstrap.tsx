import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import { refreshSession } from '@/features/auth/api';
import { clearAuthentication, establishSession } from '@/features/auth/session';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';
import { useAuthStore } from '@/stores/authStore';

const SessionPending = () => (
  <Box
    component="main"
    aria-busy="true"
    sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}
  >
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <CircularProgress aria-label="Restoring your session" />
      <Typography variant="h4" component="h1">
        Getting the huddle ready
      </Typography>
      <Typography color="text.secondary">
        Checking for an existing session…
      </Typography>
    </Stack>
  </Box>
);

interface SessionRecoveryProps {
  readonly onContinue: () => void;
  readonly onRetry: () => void;
}

const SessionRecovery = ({ onContinue, onRetry }: SessionRecoveryProps) => (
  <Container
    component="main"
    maxWidth="sm"
    sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', py: 6 }}
  >
    <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Typography variant="overline" color="warning.main">
        CONNECTION CHECK
      </Typography>
      <Typography variant="h3" component="h1">
        We couldn’t restore your session.
      </Typography>
      <Typography color="text.secondary">
        The API may be temporarily unavailable. Retry now, or continue signed
        out and try again later.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" onClick={onRetry}>
          Retry session check
        </Button>
        <Button variant="outlined" onClick={onContinue}>
          Continue signed out
        </Button>
      </Stack>
    </Stack>
  </Container>
);

export const SessionBootstrap = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const { publicClient } = useApiClients();
  const restorationStatus = useAuthStore((state) => state.restorationStatus);
  const activeRestoration = useRef<Promise<void> | null>(null);

  const restore = useCallback(() => {
    if (activeRestoration.current !== null) {
      return activeRestoration.current;
    }

    useAuthStore.getState().setRestorationStatus('pending');
    const restoration = refreshSession(publicClient)
      .then((session) => establishSession(queryClient, session))
      .catch((error: unknown) => {
        const status =
          error instanceof ApiError && error.status === 401
            ? 'anonymous'
            : 'error';
        clearAuthentication(queryClient, status);
      })
      .finally(() => {
        activeRestoration.current = null;
      });
    activeRestoration.current = restoration;
    return restoration;
  }, [publicClient, queryClient]);

  useEffect(() => {
    if (restorationStatus === 'pending') {
      void restore();
    }
  }, [restorationStatus, restore]);

  if (restorationStatus === 'pending') {
    return <SessionPending />;
  }

  if (restorationStatus === 'error') {
    return (
      <SessionRecovery
        onRetry={() => void restore()}
        onContinue={() => clearAuthentication(queryClient)}
      />
    );
  }

  return children;
};
