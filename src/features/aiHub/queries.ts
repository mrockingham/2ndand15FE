import { useQuery } from '@tanstack/react-query';

import {
  getModelPerformance,
  getPredictions,
  getWeeklyInsights,
} from '@/features/aiHub/api';
import { aiHubKeys } from '@/features/aiHub/queryKeys';
import type {
  PredictionListFilters,
  WeeklyInsightsFilters,
} from '@/features/aiHub/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const retryPublic = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useWeeklyInsightsQuery = (
  filters: WeeklyInsightsFilters,
  enabled = true,
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: aiHubKeys.weeklyInsights(filters),
    queryFn: ({ signal }) => getWeeklyInsights(publicClient, filters, signal),
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};

export const usePredictionsQuery = (filters: PredictionListFilters) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: aiHubKeys.predictions(filters),
    queryFn: ({ signal }) => getPredictions(publicClient, filters, signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};

export const useModelPerformanceQuery = () => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: aiHubKeys.performance(),
    queryFn: ({ signal }) => getModelPerformance(publicClient, signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: retryPublic,
  });
};
