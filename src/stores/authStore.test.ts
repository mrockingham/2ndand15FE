import { useAuthStore } from '@/stores/authStore';

describe('memory-only authentication store', () => {
  it('stores access tokens only in Zustand memory', () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    useAuthStore.getState().setSession({
      accessToken: 'memory-token',
      accessTokenExpiresIn: 900,
    });

    expect(useAuthStore.getState().accessToken).toBe('memory-token');
    expect(useAuthStore.getState().accessTokenExpiresAt).toBeGreaterThan(
      Date.now(),
    );
    expect(localStorageSpy).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });
});
