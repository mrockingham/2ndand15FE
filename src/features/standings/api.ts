import type { ApiClient } from '@/services/api/apiClient';
import type {
  StandingsFilters,
  StandingsResponse,
} from '@/features/standings/types';

export const getStandings = (
  client: ApiClient,
  filters: StandingsFilters,
  signal?: AbortSignal,
) => {
  const parameters = new URLSearchParams({
    season: String(filters.season),
    seasonType: filters.seasonType,
    view: filters.view,
  });
  return client.request<StandingsResponse>(`/standings?${parameters}`, {
    signal,
  });
};
