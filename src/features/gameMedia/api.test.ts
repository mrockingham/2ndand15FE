import {
  createCuratedVideo,
  deleteCuratedVideo,
  getAdminGameMediaDetail,
  getGameMedia,
  listAdminGameMedia,
  reorderCuratedVideos,
  updateCuratedVideo,
} from '@/features/gameMedia/api';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';
import {
  adminGameMediaDetailCuratedFixture,
  adminGameMediaListItemFixture,
  curatedVideoFixture,
  gameMediaCuratedResultFixture,
} from '@/test/gameMediaFixtures';

const client = (fetchImplementation: typeof fetch) =>
  createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    fetchImplementation,
    getAccessToken: () => 'token',
  });

describe('gameMedia api', () => {
  it('lists admin games with filters as query params, tolerating the backend response having no meta envelope', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: [adminGameMediaListItemFixture] }),
      );
    await expect(
      listAdminGameMedia(client(fetchImplementation), {
        season: 2026,
        seasonType: 'REG',
        week: 16,
      }),
    ).resolves.toEqual({
      games: [adminGameMediaListItemFixture],
      nextCursor: null,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining(
        '/admin/game-media/games?season=2026&seasonType=REG&week=16',
      ),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('gets admin game media detail', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: adminGameMediaDetailCuratedFixture }),
      );
    await expect(
      getAdminGameMediaDetail(client(fetchImplementation), 'game-1'),
    ).resolves.toEqual(adminGameMediaDetailCuratedFixture);
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/admin/game-media/games/game-1'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates a curated video via POST', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: curatedVideoFixture }));
    await createCuratedVideo(client(fetchImplementation), 'game-1', {
      title: curatedVideoFixture.title,
      embedUrl: curatedVideoFixture.embedUrl,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/admin/game-media/games/game-1/videos'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('updates a curated video via PATCH', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: curatedVideoFixture }));
    await updateCuratedVideo(client(fetchImplementation), 'video-1', {
      title: 'New title',
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/admin/game-media/videos/video-1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('reorders curated videos via PUT', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: adminGameMediaDetailCuratedFixture }),
      );
    await reorderCuratedVideos(client(fetchImplementation), 'game-1', {
      orderedVideoIds: ['a', 'b'],
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/admin/game-media/games/game-1/videos/order'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('deletes a curated video via DELETE', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(undefined, 204));
    await deleteCuratedVideo(client(fetchImplementation), 'video-1');
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/admin/game-media/videos/video-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('gets public game media without authentication', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: gameMediaCuratedResultFixture }));
    await expect(
      getGameMedia(client(fetchImplementation), 'game-1'),
    ).resolves.toEqual(gameMediaCuratedResultFixture);
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('/games/game-1/media'),
      expect.objectContaining({ method: 'GET' }),
    );
    const headers = fetchImplementation.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });
});
