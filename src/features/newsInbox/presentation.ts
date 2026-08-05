import type {
  NewsCandidateStatus,
  NewsIngestionRunStatus,
  NewsSourceKind,
  NewsSourceStatus,
} from '@/features/newsInbox/types';

export const sourceKindLabel: Readonly<Record<NewsSourceKind, string>> = {
  RSS: 'RSS',
  ATOM: 'Atom',
  MANUAL_ONLY: 'Manual only',
};
export const sourceStatusLabel: Readonly<Record<NewsSourceStatus, string>> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  DISABLED: 'Disabled',
  ERROR: 'Error',
};
export const candidateStatusLabel: Readonly<
  Record<NewsCandidateStatus, string>
> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  SAVED: 'Saved',
  CONVERTED: 'Converted',
  DISMISSED: 'Dismissed',
};
export const runStatusLabel: Readonly<Record<NewsIngestionRunStatus, string>> =
  {
    RUNNING: 'Running',
    SUCCEEDED: 'Succeeded',
    PARTIAL: 'Partial',
    FAILED: 'Failed',
  };

export const formatInboxDate = (value: string | null) => {
  if (value === null) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(parsed);
};

export const safeHostname = (value: string | null) => {
  if (value === null) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};
