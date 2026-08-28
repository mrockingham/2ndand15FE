import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getStandings } from '@/features/standings/api';
import { standingsKeys } from '@/features/standings/queryKeys';
import type { StandingsFilters } from '@/features/standings/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

export const useStandingsQuery = (filters: StandingsFilters) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: standingsKeys.view(filters),
    queryFn: ({ signal }) => getStandings(publicClient, filters, signal),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
      count < 2,
  });
};
