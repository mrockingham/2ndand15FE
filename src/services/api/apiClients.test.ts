import { createAppQueryClient } from '@/app/queryClient';
import { userKeys } from '@/features/users/queryKeys';
import { createAuthApiClients } from '@/features/auth/createAuthApiClients';
import { ApiError } from '@/services/api/apiClient';
import { useAuthStore } from '@/stores/authStore';
import {
  apiErrorResponse,
  authenticationResponse,
  currentUserFixture,
  jsonResponse,
} from '@/test/authFixtures';

const setAuthenticated = () => {
  useAuthStore.setState({
    accessToken: 'expired-token',
    accessTokenExpiresAt: Date.now() - 1,
    restorationStatus: 'authenticated',
  });
};

describe('authenticated API refresh coordination', () => {
  it('shares one refresh operation across concurrent 401 responses', async () => {
    setAuthenticated();
    const queryClient = createAppQueryClient();
    let releaseRefresh: (() => void) | undefined;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    let refreshCount = 0;
    const attempts = new Map<string, number>();
    const fetchImplementation = vi.fn<typeof fetch>(async (input) => {
      const path = new URL(String(input)).pathname;
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        await refreshGate;
        return jsonResponse(authenticationResponse());
      }

      const attempt = (attempts.get(path) ?? 0) + 1;
      attempts.set(path, attempt);
      return attempt === 1
        ? apiErrorResponse(
            'UNAUTHORIZED',
            'A valid access token is required.',
            401,
          )
        : jsonResponse({ data: path });
    });
    const { authenticatedClient } = createAuthApiClients({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      queryClient,
    });

    const first = authenticatedClient.request('/first', {
      authenticated: true,
    });
    const second = authenticatedClient.request('/second', {
      authenticated: true,
    });
    await vi.waitFor(() => expect(refreshCount).toBe(1));
    releaseRefresh?.();

    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(refreshCount).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe(
      'memory-only-access-token',
    );
    expect(queryClient.getQueryData(userKeys.me)).toEqual(currentUserFixture);
  });

  it('clears token and current-user data when refresh fails', async () => {
    setAuthenticated();
    const queryClient = createAppQueryClient();
    queryClient.setQueryData(userKeys.me, currentUserFixture);
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const path = new URL(String(input)).pathname;
      return Promise.resolve(
        path.endsWith('/auth/refresh')
          ? apiErrorResponse(
              'INVALID_REFRESH_TOKEN',
              'The refresh session is invalid or expired.',
              401,
            )
          : apiErrorResponse('UNAUTHORIZED', 'Authentication required.', 401),
      );
    });
    const { authenticatedClient } = createAuthApiClients({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      queryClient,
    });

    await expect(
      authenticatedClient.request('/protected', { authenticated: true }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().restorationStatus).toBe('anonymous');
    expect(queryClient.getQueryData(userKeys.me)).toBeUndefined();
  });

  it('retries the authenticated request at most once', async () => {
    setAuthenticated();
    const queryClient = createAppQueryClient();
    let protectedCount = 0;
    let refreshCount = 0;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const path = new URL(String(input)).pathname;
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return Promise.resolve(jsonResponse(authenticationResponse()));
      }
      protectedCount += 1;
      return Promise.resolve(
        apiErrorResponse('UNAUTHORIZED', 'Authentication required.', 401),
      );
    });
    const { authenticatedClient } = createAuthApiClients({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      queryClient,
    });

    await expect(
      authenticatedClient.request('/protected', { authenticated: true }),
    ).rejects.toMatchObject({ status: 401 });
    expect(refreshCount).toBe(1);
    expect(protectedCount).toBe(2);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
