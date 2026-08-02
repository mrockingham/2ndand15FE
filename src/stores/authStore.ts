import { create } from 'zustand';

export type RestorationStatus =
  'pending' | 'authenticated' | 'anonymous' | 'error';

interface AccessTokenInput {
  readonly accessToken: string;
  readonly accessTokenExpiresIn: number;
}

interface AuthState {
  readonly accessToken: string | null;
  readonly accessTokenExpiresAt: number | null;
  readonly restorationStatus: RestorationStatus;
  readonly setSession: (session: AccessTokenInput) => void;
  readonly clearSession: () => void;
  readonly setRestorationStatus: (status: RestorationStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  accessTokenExpiresAt: null,
  restorationStatus: 'pending',
  setSession: ({ accessToken, accessTokenExpiresIn }) =>
    set({
      accessToken,
      accessTokenExpiresAt: Date.now() + accessTokenExpiresIn * 1000,
    }),
  clearSession: () =>
    set({
      accessToken: null,
      accessTokenExpiresAt: null,
    }),
  setRestorationStatus: (restorationStatus) => set({ restorationStatus }),
}));
