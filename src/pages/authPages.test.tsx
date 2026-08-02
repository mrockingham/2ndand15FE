import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { userKeys } from '@/features/users/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import {
  apiErrorResponse,
  authenticationResponse,
  authenticationWithFavoriteFixture,
  currentUserFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const genericResetMessage =
  'If an account exists for that email, password reset instructions have been sent.';

const fillLoginForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Email'), 'fan@example.com');
  await user.type(screen.getByLabelText('Password'), 'a secure password');
};

const fillRegistrationForm = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.type(screen.getByLabelText('Email'), 'fan@example.com');
  await user.type(screen.getByLabelText('Display name'), 'Fourth Down Fan');
  await user.type(screen.getByLabelText('Password'), 'a secure password');
  await user.type(
    screen.getByLabelText('Confirm password'),
    'a secure password',
  );
};

describe('registration', () => {
  it('registers successfully without submitting confirmPassword', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(authenticationResponse(), 201))
      .mockResolvedValueOnce(jsonResponse({ data: [] }));
    const { queryClient } = renderApp('/register', { fetchImplementation });
    await fillRegistrationForm(user);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByRole('heading', {
        name: /choose your favorite team/i,
      }),
    ).toBeInTheDocument();
    const request = fetchImplementation.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body)) as Record<string, unknown>;
    expect(body).toEqual({
      displayName: 'Fourth Down Fan',
      email: 'fan@example.com',
      password: 'a secure password',
    });
    expect(body).not.toHaveProperty('confirmPassword');
    expect(useAuthStore.getState().accessToken).toBe(
      'memory-only-access-token',
    );
    expect(queryClient.getQueryData(userKeys.me)).toEqual(currentUserFixture);
  });

  it('shows frontend validation before sending an invalid registration', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>();
    renderApp('/register', { fetchImplementation });

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Enter your email address.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 12 characters.'),
    ).toBeInTheDocument();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('maps duplicate-email errors safely', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        apiErrorResponse(
          'EMAIL_ALREADY_REGISTERED',
          'An account with that email already exists.',
          409,
        ),
      );
    renderApp('/register', { fetchImplementation });
    await fillRegistrationForm(user);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText(/account with that email already exists/i),
    ).toBeInTheDocument();
  });
});

describe('login and route guards', () => {
  it('logs in and restores the intended protected destination', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(authenticationResponse(authenticationWithFavoriteFixture)),
      );
    renderApp(
      { pathname: '/login', state: { from: '/account' } },
      { fetchImplementation },
    );
    await fillLoginForm(user);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('accessToken')).toBeNull();
    expect(window.sessionStorage.length).toBe(0);
  });

  it('uses generic invalid-credentials messaging', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        apiErrorResponse(
          'INVALID_CREDENTIALS',
          'Invalid email or password.',
          401,
        ),
      );
    renderApp('/login', { fetchImplementation });
    await fillLoginForm(user);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument();
  });

  it('redirects a signed-out user to login and preserves the account destination', async () => {
    renderApp('/account');

    expect(
      await screen.findByRole('heading', { name: /sign in to your huddle/i }),
    ).toBeInTheDocument();
  });

  it('redirects an authenticated user away from public-only auth routes', async () => {
    renderApp('/login', {
      currentUser: authenticationWithFavoriteFixture.user,
      restorationStatus: 'authenticated',
    });

    expect(
      await screen.findByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
  });

  it('rejects an unsafe external intended destination', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(authenticationResponse(authenticationWithFavoriteFixture)),
      );
    renderApp(
      { pathname: '/login', state: { from: 'https://evil.example/steal' } },
      { fetchImplementation },
    );
    await fillLoginForm(user);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
    expect(window.location.origin).not.toBe('https://evil.example');
  });
});

describe('current user and logout', () => {
  it('loads the current user through the authenticated query', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: { user: currentUserFixture } }));
    renderApp('/account', {
      currentUser: null,
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    expect(screen.getByLabelText('Loading your account')).toBeInTheDocument();
    expect(await screen.findByText('Fourth Down Fan')).toBeInTheDocument();
    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get('Authorization')).toBe(
      'Bearer test-access-token',
    );
  });

  it('logs out successfully from a 204 response', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const { queryClient } = renderApp('/account', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(
      await screen.findByRole('heading', { name: /sign in to your huddle/i }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(queryClient.getQueryData(userKeys.me)).toBeUndefined();
  });

  it('clears local authentication when the logout request fails', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('network unavailable'));
    renderApp('/account', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(
      await screen.findByRole('heading', { name: /sign in to your huddle/i }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});

describe('password recovery', () => {
  it('shows the backend generic forgot-password response', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: { message: genericResetMessage } }),
      );
    renderApp('/forgot-password', { fetchImplementation });

    await user.type(screen.getByLabelText('Email'), 'unknown@example.com');
    await user.click(
      screen.getByRole('button', { name: /send reset instructions/i }),
    );

    expect(await screen.findByText(genericResetMessage)).toBeInTheDocument();
    expect(screen.queryByText(/unknown@example.com/i)).not.toBeInTheDocument();
  });

  it('shows a missing-token reset state without making a request', () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    renderApp('/reset-password', { fetchImplementation });

    expect(
      screen.getByRole('heading', { name: /request a fresh link/i }),
    ).toBeInTheDocument();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('resets a password and clears local authentication', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: { message: 'Password reset successfully. Please log in again.' },
      }),
    );
    renderApp(`/reset-password?token=${'a'.repeat(32)}`, {
      accessToken: 'previous-token',
      fetchImplementation,
      restorationStatus: 'anonymous',
    });

    await user.type(
      screen.getByLabelText('New password'),
      'new secure password',
    );
    await user.type(
      screen.getByLabelText('Confirm new password'),
      'new secure password',
    );
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText(/password reset successfully/i),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBeNull();
    const requestBody = JSON.parse(
      String(fetchImplementation.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(requestBody).toEqual({
      password: 'new secure password',
      token: 'a'.repeat(32),
    });
    expect(window.location.search).not.toContain('token');
  });

  it('handles an invalid or expired reset token', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        apiErrorResponse(
          'INVALID_RESET_TOKEN',
          'The password reset token is invalid or expired.',
          400,
        ),
      );
    renderApp(`/reset-password?token=${'b'.repeat(32)}`, {
      fetchImplementation,
    });

    await user.type(
      screen.getByLabelText('New password'),
      'new secure password',
    );
    await user.type(
      screen.getByLabelText('Confirm new password'),
      'new secure password',
    );
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText(/reset link is invalid or has expired/i),
    ).toBeInTheDocument();
  });
});
