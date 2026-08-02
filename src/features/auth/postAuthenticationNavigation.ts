import { readIntendedDestination } from '@/features/auth/safeRedirect';
import type { CurrentUser } from '@/features/users/types';

export const getPostAuthenticationNavigation = (
  user: CurrentUser,
  locationState: unknown,
) => {
  const intendedDestination = readIntendedDestination(locationState);

  if (user.favoriteTeam === null) {
    return {
      pathname: '/choose-team',
      state: { from: intendedDestination },
    } as const;
  }

  return { pathname: intendedDestination, state: undefined } as const;
};
