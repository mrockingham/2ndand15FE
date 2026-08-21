import { screen, waitFor } from '@testing-library/react';

import { userKeys } from '@/features/users/queryKeys';
import {
  billsFixture,
  currentUserFixture,
  eaglesFixture,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

describe('TeamVisualThemeProvider', () => {
  it('uses default purple when logged out or when no favorite is selected', () => {
    const anonymous = renderApp('/not-a-route');
    expect(screen.getByTestId('team-visual-theme-root')).toHaveAttribute(
      'data-team-visual',
      'DEFAULT',
    );
    anonymous.unmount();

    renderApp('/not-a-route', {
      restorationStatus: 'authenticated',
      currentUser: currentUserFixture,
    });
    expect(screen.getByTestId('team-visual-theme-root')).toHaveStyle({
      '--team-primary': '#8064FF',
    });
  });

  it('uses an authenticated favorite and reacts to cache updates without reload', async () => {
    const { queryClient } = renderApp('/not-a-route', {
      restorationStatus: 'authenticated',
      currentUser: { ...currentUserFixture, favoriteTeam: eaglesFixture },
    });
    const root = screen.getByTestId('team-visual-theme-root');
    expect(root).toHaveAttribute('data-team-visual', 'PHI');
    expect(root).toHaveStyle({ '--team-primary': '#004C54' });

    queryClient.setQueryData(userKeys.me, {
      ...currentUserFixture,
      favoriteTeam: billsFixture,
    });
    await waitFor(() =>
      expect(root).toHaveAttribute('data-team-visual', 'BUF'),
    );
    expect(root).toHaveStyle({ '--team-primary': '#00338D' });
  });
});
