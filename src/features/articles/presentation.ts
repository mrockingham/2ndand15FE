import type { ArticleContentType } from '@/features/articles/types';

export const contentTypeLabel = (
  contentType: ArticleContentType,
): 'VIDEO' | 'HIGHLIGHT' | null => {
  if (contentType === 'VIDEO') return 'VIDEO';
  if (contentType === 'HIGHLIGHT') return 'HIGHLIGHT';
  return null;
};

export const contentTypeChipColor = (
  contentType: ArticleContentType,
): 'info' | 'success' | 'default' => {
  if (contentType === 'VIDEO') return 'info';
  if (contentType === 'HIGHLIGHT') return 'success';
  return 'default';
};

export const watchActionLabel = (
  contentType: 'VIDEO' | 'HIGHLIGHT',
  sourceName: string | null,
): string =>
  contentType === 'HIGHLIGHT'
    ? 'Watch Highlight'
    : `Watch on ${sourceName ?? 'source'}`;

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatPublishedAgo = (iso: string, now = Date.now()): string => {
  const publishedMs = new Date(iso).getTime();
  if (Number.isNaN(publishedMs)) return 'Unknown';
  const ageMs = Math.max(0, now - publishedMs);
  if (ageMs < 60_000) return 'Just now';
  const minutes = Math.round(ageMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 6) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: publishedMs < now - 365 * DAY_MS ? 'numeric' : undefined,
  });
};
