import { screen } from '@testing-library/react';

import { userKeys } from '@/features/users/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import {
  apiErrorResponse,
  authenticationResponse,
  currentUserFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

describe('startup session restoration', () => {
  it('restores a session and seeds the current-user query', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(authenticationResponse()));
    const { queryClient } = renderApp('/', {
      fetchImplementation,
      restorationStatus: 'pending',
    });

    expect(screen.getByLabelText('Restoring your session')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().restorationStatus).toBe('authenticated');
    expect(useAuthStore.getState().accessToken).toBe(
      'memory-only-access-token',
    );
    expect(queryClient.getQueryData(userKeys.me)).toEqual(currentUserFixture);
  });

  it('continues signed out after an expected invalid refresh session', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        apiErrorResponse(
          'INVALID_REFRESH_TOKEN',
          'The refresh session is invalid or expired.',
          401,
        ),
      );
    renderApp('/', { fetchImplementation, restorationStatus: 'pending' });

    expect(
      await screen.findByRole('heading', { name: /see the game/i }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().restorationStatus).toBe('anonymous');
  });

  it('shows a recoverable state for an unexpected network failure', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('network unavailable'));
    renderApp('/', { fetchImplementation, restorationStatus: 'pending' });

    expect(
      await screen.findByRole('heading', {
        name: /couldn’t restore your session/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry session check/i }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().restorationStatus).toBe('error');
  });
});
