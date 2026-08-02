import { updateFavoriteTeam } from '@/features/teams/api';
import { createApiClient } from '@/services/api/apiClient';
import { currentUserFixture, jsonResponse } from '@/test/authFixtures';

describe('favorite-team API', () => {
  it('supports repeated clear requests without changing the payload shape', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse({
          data: { user: currentUserFixture },
        }),
      ),
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'access-token',
    });

    await updateFavoriteTeam(apiClient, null);
    await updateFavoriteTeam(apiClient, null);

    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    for (const call of fetchImplementation.mock.calls) {
      expect(call[0]).toBe(
        'http://localhost:3000/api/v1/users/me/favorite-team',
      );
      expect(JSON.parse(String(call[1]?.body))).toEqual({
        favoriteTeamId: null,
      });
    }
  });
});
