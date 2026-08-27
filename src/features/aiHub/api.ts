import type {
  PredictionListFilters,
  PublicModelPerformance,
  PublicPrediction,
  WeeklyInsights,
  WeeklyInsightsFilters,
} from '@/features/aiHub/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

export const getWeeklyInsights = async (
  client: ApiClient,
  filters: WeeklyInsightsFilters,
  signal?: AbortSignal,
) => {
  const parameters = new URLSearchParams({
    season: String(filters.season),
    seasonType: filters.seasonType,
    week: String(filters.week),
    top: String(filters.top),
    ...(filters.teamId === undefined ? {} : { teamId: filters.teamId }),
  });
  const response = await client.request<DataResponse<WeeklyInsights>>(
    `/ai-hub/weekly-insights?${parameters.toString()}`,
    { method: 'GET', signal },
  );
  return response.data;
};

export const getPredictions = async (
  client: ApiClient,
  filters: PredictionListFilters,
  signal?: AbortSignal,
) => {
  const parameters = new URLSearchParams({
    season: String(filters.season),
    seasonType: filters.seasonType,
    week: String(filters.week),
    limit: String(filters.limit),
  });
  const response = await client.request<
    DataResponse<readonly PublicPrediction[]>
  >(`/ai-hub/predictions?${parameters.toString()}`, { method: 'GET', signal });
  return response.data;
};

export const getModelPerformance = async (
  client: ApiClient,
  signal?: AbortSignal,
) => {
  const response = await client.request<DataResponse<PublicModelPerformance>>(
    '/ai-hub/performance',
    { method: 'GET', signal },
  );
  return response.data;
};
