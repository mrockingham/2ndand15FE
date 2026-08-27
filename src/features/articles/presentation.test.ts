import { describe, expect, it } from 'vitest';

import {
  contentTypeChipColor,
  contentTypeLabel,
  formatPublishedAgo,
  watchActionLabel,
} from '@/features/articles/presentation';

describe('contentTypeLabel', () => {
  it('returns a label only for VIDEO and HIGHLIGHT', () => {
    expect(contentTypeLabel('VIDEO')).toBe('VIDEO');
    expect(contentTypeLabel('HIGHLIGHT')).toBe('HIGHLIGHT');
    expect(contentTypeLabel('ARTICLE')).toBeNull();
  });
});

describe('contentTypeChipColor', () => {
  it('maps each content type to a distinct color', () => {
    expect(contentTypeChipColor('VIDEO')).toBe('info');
    expect(contentTypeChipColor('HIGHLIGHT')).toBe('success');
    expect(contentTypeChipColor('ARTICLE')).toBe('default');
  });
});

describe('watchActionLabel', () => {
  it('names the source for VIDEO and stays generic for HIGHLIGHT', () => {
    expect(watchActionLabel('VIDEO', 'Green Bay Packers')).toBe(
      'Watch on Green Bay Packers',
    );
    expect(watchActionLabel('VIDEO', null)).toBe('Watch on source');
    expect(watchActionLabel('HIGHLIGHT', 'Chicago Bears')).toBe(
      'Watch Highlight',
    );
  });
});

describe('formatPublishedAgo', () => {
  const now = new Date('2026-08-24T12:00:00.000Z').getTime();

  it('formats recent times as relative strings', () => {
    expect(formatPublishedAgo('2026-08-24T11:59:30.000Z', now)).toBe(
      'Just now',
    );
    expect(formatPublishedAgo('2026-08-24T11:30:00.000Z', now)).toBe('30m ago');
    expect(formatPublishedAgo('2026-08-24T10:00:00.000Z', now)).toBe('2h ago');
  });

  it('says Yesterday for one day ago', () => {
    expect(formatPublishedAgo('2026-08-23T12:00:00.000Z', now)).toBe(
      'Yesterday',
    );
  });

  it('uses day counts for the next several days', () => {
    expect(formatPublishedAgo('2026-08-20T12:00:00.000Z', now)).toBe('4d ago');
  });

  it('falls back to an absolute date beyond the recent window', () => {
    expect(formatPublishedAgo('2026-08-01T12:00:00.000Z', now)).toBe(
      new Date('2026-08-01T12:00:00.000Z').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: undefined,
      }),
    );
  });

  it('returns Unknown for an unparseable timestamp', () => {
    expect(formatPublishedAgo('not-a-date', now)).toBe('Unknown');
  });
});
