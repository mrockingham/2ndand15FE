import type { HighlightCandidateListFilters } from '@/features/homepage/types';

export const homepageKeys = {
  all: ['homepage', 'public'] as const,
};

export const adminHomepageKeys = {
  all: ['homepage', 'admin'] as const,
  hero: () => [...adminHomepageKeys.all, 'hero'] as const,
  heroDetail: (slideId: string) =>
    [...adminHomepageKeys.hero(), slideId] as const,
  topStories: () => [...adminHomepageKeys.all, 'top-stories'] as const,
  highlights: () => [...adminHomepageKeys.all, 'highlights'] as const,
  highlightCandidates: (filters: HighlightCandidateListFilters) =>
    [...adminHomepageKeys.all, 'highlight-candidates', filters] as const,
};
