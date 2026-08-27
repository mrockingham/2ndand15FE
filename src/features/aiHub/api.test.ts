import {
  getModelPerformance,
  getPredictions,
  getWeeklyInsights,
} from '@/features/aiHub/api';
import type { ApiClient } from '@/services/api/apiClient';

describe('AI Hub weekly insights API', () => {
  it('requests one bounded public weekly view with an optional team', async () => {
    const request = vi.fn().mockResolvedValue({ data: { context: {} } });
    const client = { request } as unknown as ApiClient;

    await getWeeklyInsights(client, {
      season: 2026,
      seasonType: 'PRE',
      week: 1,
      top: 3,
      teamId: 'team-id',
    });

    expect(request).toHaveBeenCalledWith(
      '/ai-hub/weekly-insights?season=2026&seasonType=PRE&week=1&top=3&teamId=team-id',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests the reviewed prediction list for the selected context', async () => {
    const request = vi.fn().mockResolvedValue({ data: [] });
    const client = { request } as unknown as ApiClient;

    await getPredictions(client, {
      season: 2026,
      seasonType: 'PRE',
      week: 1,
      limit: 50,
    });

    expect(request).toHaveBeenCalledWith(
      '/ai-hub/predictions?season=2026&seasonType=PRE&week=1&limit=50',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests public model performance independently', async () => {
    const request = vi.fn().mockResolvedValue({ data: { evaluated: 0 } });
    const client = { request } as unknown as ApiClient;

    await getModelPerformance(client);

    expect(request).toHaveBeenCalledWith(
      '/ai-hub/performance',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
