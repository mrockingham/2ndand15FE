import type { AuthenticationData } from '@/features/auth/types';
import type { CurrentUser } from '@/features/users/types';
import type { Team } from '@/features/teams/types';

export const billsFixture: Team = {
  id: '8ef55f16-d6f7-4da4-9f4b-0a8e3461b786',
  league: 'NFL',
  city: 'Buffalo',
  name: 'Bills',
  fullName: 'Buffalo Bills',
  abbreviation: 'BUF',
  conference: 'AFC',
  division: 'East',
  primaryColor: '#00338D',
  secondaryColor: '#C60C30',
  logoUrl: null,
  logoSource: null,
  isActive: true,
  createdAt: '2026-07-28T12:00:00.000Z',
  updatedAt: '2026-07-28T12:00:00.000Z',
};

export const eaglesFixture: Team = {
  ...billsFixture,
  id: '486ae199-9607-4fb5-835c-25aee38656af',
  city: 'Philadelphia',
  name: 'Eagles',
  fullName: 'Philadelphia Eagles',
  abbreviation: 'PHI',
  conference: 'NFC',
  division: 'East',
  primaryColor: '#004C54',
  secondaryColor: '#A5ACAF',
};

export const currentUserFixture: CurrentUser = {
  id: '8ccf7099-f606-4e42-b15a-52bf7ceaa3df',
  email: 'fan@example.com',
  displayName: 'Fourth Down Fan',
  isActive: true,
  role: 'USER',
  favoriteTeam: null,
  createdAt: '2026-07-29T12:00:00.000Z',
  updatedAt: '2026-07-29T12:00:00.000Z',
};

export const authenticationFixture: AuthenticationData = {
  user: currentUserFixture,
  accessToken: 'memory-only-access-token',
  accessTokenExpiresIn: 900,
};

export const userWithFavoriteFixture: CurrentUser = {
  ...currentUserFixture,
  favoriteTeam: billsFixture,
};

export const authenticationWithFavoriteFixture: AuthenticationData = {
  ...authenticationFixture,
  user: userWithFavoriteFixture,
};

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const authenticationResponse = (session = authenticationFixture) => ({
  data: session,
});

export const apiErrorResponse = (
  code: string,
  message: string,
  status: number,
  details?: unknown,
) =>
  jsonResponse(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
        requestId: 'test-request-id',
      },
    },
    status,
  );
