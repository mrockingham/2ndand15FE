import type { Team } from '@/features/teams/types';

export type UserRole = 'USER' | 'EDITOR' | 'ADMIN';

export interface CurrentUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly isActive: boolean;
  readonly role: UserRole;
  readonly favoriteTeam: Team | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurrentUserResponse {
  readonly data: {
    readonly user: CurrentUser;
  };
}
